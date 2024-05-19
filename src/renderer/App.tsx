import React from 'react';
import './App.css';
import {HashRouter as Router, Route, Switch} from "react-router-dom";
import HomeTemplate from "./pages/HomeTemplate";
import {GlobalProvider} from "./hooks/useGloble";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import HomePage from "./pages/HomePage";
import VideoPage from "./pages/VideoPage";
import SettingPage from "./pages/SettingPage";
import ChannelListPage from "./pages/ChannelListPage";


const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalProvider>
        <Router basename="/home">
          <HomeTemplate>
            <Switch>
              <Route exact path="/" component={HomePage}/>
              <Route path="/video/:videoId" component={VideoPage}/>
              {/*<Route path="/channel" component={ChannelListPage}/>*/}
              <Route path="/setting" component={SettingPage}/>
            </Switch>
          </HomeTemplate>
        </Router>
      </GlobalProvider>
    </QueryClientProvider>
  )
}

export default App;
