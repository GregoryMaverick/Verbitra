import { Switch, Route } from "wouter";
import Landing from "./App";
import Privacy from "./pages/privacy";

export default function RouterApp() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/privacy" component={Privacy} />
      <Route>
        <div className="landing-root legal-root">
          <div className="shell legal-shell">
            <p className="eyebrow">404</p>
            <h1 className="section-title">Page not found.</h1>
            <p className="section-body">Check the URL and try again.</p>
            <a className="button button-ghost legal-back" href="/">
              Back to home
            </a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

