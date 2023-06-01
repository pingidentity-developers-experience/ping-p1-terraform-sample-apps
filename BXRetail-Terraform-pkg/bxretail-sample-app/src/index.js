import React from 'react';
import ReactDOM from 'react-dom';
import './styles/main.scss';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import Home from './pages/home'; 
import Shop from './pages/shop/index'; 
import Checkout from './pages/shop/checkout'; 
import DashboardSettings from './pages/dashboard/settings/index'; 
import DashboardSettingsProfile from './pages/dashboard/settings/profile'; 
import DashboardSettingsPrivacySecurity from './pages/dashboard/settings/privacy-security'; 
// import Partner from './pages/partner/index'; 
// import PartnerClient from './pages/partner/client'; 
import AnyMarketing from './pages/any-marketing'; 
import * as serviceWorker from './serviceWorker';


const routing = (
    <Router basename={`${window._env_.PUBLIC_URL}`}>
        <Switch>
            <Route exact path='/shop'>
                <Shop />
            </Route>
            <Route path='/shop/checkout'>
                <Checkout />
            </Route>
            <Route path='/dashboard/settings/privacy-security'>
                <DashboardSettingsPrivacySecurity />
            </Route>
            <Route path='/dashboard/settings/profile'>
                <DashboardSettingsProfile />
            </Route>
            <Route path='/dashboard/settings'>
                <DashboardSettings />
            </Route>
            {/*<Route path='/partner/client'>
                <PartnerClient />
            </Route>
            <Route path='/partner'>
                <Partner />
            </Route>*/}
            <Route path='/any-marketing'>
                <AnyMarketing />
            </Route>
            <Route path='/'>
                <Home />
            </Route>
        </Switch>
    </Router>
);

ReactDOM.render(routing, document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
