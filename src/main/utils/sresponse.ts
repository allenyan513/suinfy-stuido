const ResponseUtils = {
  success<T>(data: T) {
    return {
      code: 200,
      msg: 'success',
      data: data
    } as SResponse<T>
  },

  error(msg: string) {
    return {
      code: 500,
      msg: msg,
    } as SResponse<any>
  },
  errorWithCode(code: number, msg: string) {
    return {
      code: code,
      msg: msg,
    } as SResponse<any>
  },
  errorWith(error: any) {
    return {
      code: error.code,
      msg: error.msg,
    } as SResponse<any>
  }
}
export default ResponseUtils
