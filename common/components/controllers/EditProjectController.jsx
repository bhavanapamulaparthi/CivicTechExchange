// @flow

import React from 'react';
import EditProjectForm from '../common/projects/EditProjectForm.jsx';
import url from '../utils/url.js';
import CurrentUser from "../utils/CurrentUser.js";
import metrics from "../utils/metrics.js";
import Headers from "../common/Headers.jsx";

type State = {|
  projectId: number
|};

/**
 * Encapsulates form for editing projects
 */
class EditProjectController extends React.PureComponent<{||},State> {
  constructor(props: {||}): void {
    super(props);
  
    this.state = {
      projectId:  url.arguments(document.location.search).id
    }
  }
  
  logProjectEdited(): void {
    metrics.logProjectEdited(CurrentUser.userID(), this.state.projectId);
  }
  
  render(): React$Node {
    return (
      <React.Fragment>
        <Headers
        title="Update Project Profile | DemocracyLab"
        description="Update Project Profile"
        />
      <div className="wrapper-gray">
        <div className="container">
          <form action={`/projects/edit/${this.state.projectId}/`} onSubmit={this.logProjectEdited} method="post">
            <EditProjectForm projectId={this.state.projectId}/>
          </form>
        </div>
      </div>
      </React.Fragment>
    );
  }
}

export default EditProjectController;
