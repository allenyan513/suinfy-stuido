package gpu

import (
	"bytes"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"

	"github.com/ollama/ollama/format"
)

const (
	RocmStandardLocation = "C:\\Program Files\\AMD\\ROCm\\5.7\\bin" // TODO glob?

	// TODO  We're lookinng for this exact name to detect iGPUs since hipGetDeviceProperties never reports integrated==true
	iGPUName = "AMD Radeon(TM) Graphics"
)

var (
	// Used to validate if the given ROCm lib is usable
	ROCmLibGlobs = []string{"hipblas.dll", "rocblas"} // TODO - probably include more coverage of files here...
)

func AMDGetGPUInfo() []GpuInfo {
	resp := []GpuInfo{}
	hl, err := NewHipLib()
	if err != nil {
		slog.Debug(err.Error())
		return nil
	}
	defer hl.Release()

	ver, err := hl.AMDDriverVersion()
	if err == nil {
		slog.Info("AMD Driver: " + ver)
	} else {
		// For now this is benign, but we may eventually need to fail compatibility checks
		slog.Debug("error looking up amd driver version", "error", err)
	}

	// Note: the HIP library automatically handles subsetting to any HIP_VISIBLE_DEVICES the user specified
	count := hl.HipGetDeviceCount()
	if count == 0 {
		return nil
	}
	libDir, err := AMDValidateLibDir()
	if err != nil {
		slog.Warn("unable to verify rocm library, will use cpu", "error", err)
		return nil
	}

	var supported []string
	gfxOverride := os.Getenv("HSA_OVERRIDE_GFX_VERSION")
	if gfxOverride == "" {
		supported, err = GetSupportedGFX(libDir)
		if err != nil {
			slog.Warn("failed to lookup supported GFX types, falling back to CPU mode", "error", err)
			return nil
		}
	} else {
		slog.Debug("skipping rocm gfx compatibility check with HSA_OVERRIDE_GFX_VERSION=" + gfxOverride)
	}

	slog.Info("detected hip devices", "count", count)
	// TODO how to determine the underlying device ID when visible devices is causing this to subset?
	for i := 0; i < count; i++ {
		err = hl.HipSetDevice(i)
		if err != nil {
			slog.Warn("set device", "id", i, "error", err)
			continue
		}

		props, err := hl.HipGetDeviceProperties(i)
		if err != nil {
			slog.Warn("get properties", "id", i, "error", err)
			continue
		}
		n := bytes.IndexByte(props.Name[:], 0)
		name := string(props.Name[:n])
		// TODO is UUID actually populated on windows?
		// Can luid be used on windows for setting visible devices (and is it actually set?)
		n = bytes.IndexByte(props.GcnArchName[:], 0)
		gfx := string(props.GcnArchName[:n])
		slog.Info("hip device", "id", i, "name", name, "gfx", gfx)
		var major, minor, patch string
		switch len(gfx) {
		case 6:
			major, minor, patch = gfx[3:4], gfx[4:5], gfx[5:]
		case 7:
			major, minor, patch = gfx[3:5], gfx[5:6], gfx[6:]
		}
		//slog.Info(fmt.Sprintf("[%d] Integrated: %d", i, props.iGPU)) // DOESN'T REPORT CORRECTLY!  Always 0
		// TODO  Why isn't props.iGPU accurate!?
		if strings.EqualFold(name, iGPUName) {
			slog.Info("iGPU detected skipping", "id", i)
			continue
		}
		if gfxOverride == "" {
			if !slices.Contains[[]string, string](supported, gfx) {
				slog.Warn("amdgpu is not supported", "gpu", i, "gpu_type", gfx, "library", libDir, "supported_types", supported)
				// TODO - consider discrete markdown just for ROCM troubleshooting?
				slog.Warn("See https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md for HSA_OVERRIDE_GFX_VERSION usage")
				continue
			} else {
				slog.Info("amdgpu is supported", "gpu", i, "gpu_type", gfx)
			}
		}

		freeMemory, totalMemory, err := hl.HipMemGetInfo()
		if err != nil {
			slog.Warn("get mem info", "id", i, "error", err)
			continue
		}

		// iGPU detection, remove this check once we can support an iGPU variant of the rocm library
		if totalMemory < IGPUMemLimit {
			slog.Info("amdgpu appears to be an iGPU, skipping", "gpu", i, "total", format.HumanBytes2(totalMemory))
			continue
		}

		// TODO revisit this once ROCm v6 is available on windows.
		// v5.7 only reports VRAM used by this process, so it's completely wrong and unusable
		slog.Info("amdgpu memory", "gpu", i, "total", format.HumanBytes2(totalMemory))
		slog.Info("amdgpu memory", "gpu", i, "available", format.HumanBytes2(freeMemory))
		gpuInfo := GpuInfo{
			Library: "rocm",
			memInfo: memInfo{
				TotalMemory: totalMemory,
				FreeMemory:  freeMemory,
			},
			ID:             fmt.Sprintf("%d", i), // TODO this is probably wrong if we specify visible devices
			DependencyPath: libDir,
			MinimumMemory:  rocmMinimumMemory,
		}
		if major != "" {
			gpuInfo.Major, err = strconv.Atoi(major)
			if err != nil {
				slog.Info("failed to parse version", "version", gfx, "error", err)
			}
		}
		if minor != "" {
			gpuInfo.Minor, err = strconv.Atoi(minor)
			if err != nil {
				slog.Info("failed to parse version", "version", gfx, "error", err)
			}
		}
		if patch != "" {
			// Patch rev is hex; e.g. gfx90a
			p, err := strconv.ParseInt(patch, 16, 0)
			if err != nil {
				slog.Info("failed to parse version", "version", gfx, "error", err)
			} else {
				gpuInfo.Patch = int(p)
			}
		}
		if gpuInfo.Major < RocmComputeMin {
			slog.Warn(fmt.Sprintf("amdgpu [%s] too old gfx%d%d%x", gpuInfo.ID, gpuInfo.Major, gpuInfo.Minor, gpuInfo.Patch))
			continue
		}

		resp = append(resp, gpuInfo)
	}

	return resp
}

func AMDValidateLibDir() (string, error) {
	libDir, err := commonAMDValidateLibDir()
	if err == nil {
		return libDir, nil
	}

	// Installer payload (if we're running from some other location)
	localAppData := os.Getenv("LOCALAPPDATA")
	appDir := filepath.Join(localAppData, "Programs", "Ollama")
	rocmTargetDir := filepath.Join(appDir, "rocm")
	if rocmLibUsable(rocmTargetDir) {
		slog.Debug("detected ollama installed ROCm at " + rocmTargetDir)
		return rocmTargetDir, nil
	}

	// Should not happen on windows since we include it in the installer, but stand-alone binary might hit this
	slog.Warn("amdgpu detected, but no compatible rocm library found.  Please install ROCm")
	return "", fmt.Errorf("no suitable rocm found, falling back to CPU")
}
