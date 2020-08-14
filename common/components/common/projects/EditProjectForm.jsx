// @flow

import React from 'react';
import type {LinkInfo} from '../../../components/forms/LinkInfo.jsx'
import type {FileInfo} from '../../common/FileInfo.jsx'
import ImageCropUploadFormElement from '../../../components/forms/ImageCropUploadFormElement.jsx'
import LinkList from '../../../components/forms/LinkList.jsx'
import FileUploadList from '../../../components/forms/FileUploadList.jsx'
import TagCategory from '../../common/tags/TagCategory.jsx'
import TagSelector from '../tags/TagSelector.jsx'
import DjangoCSRFToken from 'django-react-csrftoken'
import FormValidation from '../../../components/forms/FormValidation.jsx'
import type {Validator} from '../../../components/forms/FormValidation.jsx'
import CurrentUser from "../../utils/CurrentUser.js"
import ProjectAPIUtils from '../../../components/utils/ProjectAPIUtils.js';
import type {APIError, TagDefinition, ProjectDetailsAPIData} from '../../../components/utils/ProjectAPIUtils.js';
import url from '../../utils/url.js'
import {PositionInfo} from "../../forms/PositionInfo.jsx";
import PositionList from "../../forms/PositionList.jsx";
import _ from "lodash";
import {DefaultLinkDisplayConfigurations} from "../../constants/LinkConstants.js";
import metrics from "../../utils/metrics.js";
import {CountrySelector} from "../selection/CountrySelector.jsx";
import {CountryCodeFormats, CountryData, countryByCode} from "../../constants/Countries.js";
import {LocationInfo, getLocationInfoFromProject} from "../location/LocationInfo.js";
import {LocationAutocompleteForm, LocationFormInputsByEntity} from "../../forms/LocationAutocompleteForm.jsx";



type FormFields = {|
  project_name: ?string,
  project_location: ?LocationInfo,
  project_country: ?CountryData,
  project_url: ?string,
  project_description: ?string,
  project_description_solution: ?string,
  project_description_actions: ?string,
  project_short_description: ?string,
  project_organization?: Array<TagDefinition>,
  project_organization_type?: Array<TagDefinition>,
  project_issue_area?: Array<TagDefinition>,
  project_stage?: Array<TagDefinition>,
  project_technologies?: Array<TagDefinition>,
  project_positions?: Array<PositionInfo>,
  project_links: Array<LinkInfo>,
  project_files: Array<FileInfo>,
  project_thumbnail?: FileInfo,
  link_coderepo: ?string,
  link_messaging: ?string,
  link_projmanage: ?string,
  link_filerepo: ?string
|};

type Props = {|
  projectId?: number
|};
type State = {|
  error: string,
  formIsValid: boolean,
  formFields: FormFields,
  validations: $ReadOnlyArray<Validator>
|};

/**
 * Encapsulates form for creating/editing projects
 */
class EditProjectForm extends React.PureComponent<Props,State> {
  constructor(props: Props): void {
    super(props);

    this.state = {
      error: "",
      formIsValid: false,
      formFields: {
        project_name: "",
        project_location: null,
        project_country: null,
        project_url: "",
        project_description: "",
        project_description_solution: "",
        project_description_actions: "",
        project_short_description: "",
        project_organization: [],
        project_organization_type: [],
        project_issue_area: [],
        project_stage: [],
        project_technologies: [],
        project_positions: [],
        project_thumbnail: "",
        project_links: [],
        project_files: [],
        link_coderepo: "",
        link_messaging: "",
        link_projmanage: "",
        link_filerepo: ""
      },
      validations: [
        {
          checkFunc: (formFields: FormFields) => !_.isEmpty(formFields["project_name"]),
          errorMessage: "Please enter Project Name"
        },
        {
          checkFunc: (formFields: FormFields) => !_.isEmpty(formFields["project_description"]),
          errorMessage: "Please enter Project Problem"
        }
      ]
    };
  }

  onValidationCheck(formIsValid: boolean): void {
    if(formIsValid !== this.state.formIsValid) {
      this.setState({formIsValid});
    }
  }

  componentDidMount(): void {
    if(this.props.projectId) {
      ProjectAPIUtils.fetchProjectDetails(this.props.projectId, this.loadProjectDetails.bind(this), this.handleLoadProjectError.bind(this));
    }
  }

  loadProjectDetails(project: ProjectDetailsAPIData): void {
    if(!CurrentUser.isOwner(project) && !CurrentUser.isCoOwner(project) && !CurrentUser.isStaff()) {
      this.setState({
        error: "You are not authorized to edit this Project"
      });
    } else {
      metrics.logProjectClickEdit(CurrentUser.userID(), this.props.projectId);
      const location: LocationInfo = getLocationInfoFromProject(project);
      this.setState({
        formFields: {
          project_name: project.project_name,
          project_location: location,
          project_country: countryByCode(project.project_country),
          project_url: project.project_url,
          project_description: project.project_description,
          project_description_solution: project.project_description_solution,
          project_description_actions: project.project_description_actions,
          project_short_description: project.project_short_description,
          project_organization: project.project_organization,
          project_organization_type: project.project_organization_type,
          project_issue_area: project.project_issue_area,
          project_stage: project.project_stage,
          project_technologies: project.project_technologies,
          project_files: _.cloneDeep(project.project_files),
          project_positions: _.cloneDeep(project.project_positions),
          project_thumbnail: project.project_thumbnail,
        }
      });
      //this will set formFields.project_links and formFields.links_*
      this.filterSpecificLinks(_.cloneDeep(project.project_links));
    }
  }

  handleLoadProjectError(error: APIError): void {
    this.setState({
      error: "Failed to load project information"
    });
  }

  onFormFieldChange(formFieldName: string, event: SyntheticInputEvent<HTMLInputElement>): void {
    this.state.formFields[formFieldName] = event.target.value;
    this.forceUpdate();
  }
  
  onFormFieldSelect<T>(formFieldName: string, value: T): void {
    this.state.formFields[formFieldName] = value;
  }

  onTagChange(formFieldName: string, value: $ReadOnlyArray<TagDefinition>): void {
    this.state.formFields[formFieldName] = value;
  }
  
  onCountrySelect(formFieldName: string, country: CountryData): void {
    this.state.formFields[formFieldName] = country;
    // De-select any existing location
    this.state.formFields["project_location"] = null;
    this.forceUpdate();
  }

  onSubmit(): void {
    //Sanitize project url if necessary
    if(this.state.formFields.project_url) {
      this.state.formFields.project_url = url.appendHttpIfMissingProtocol(this.state.formFields.project_url);
    }
   // create input array
   let eLinks = ['link_coderepo','link_messaging','link_filerepo','link_projmanage'].map(name => ({linkName: name, linkUrl: this.state.formFields[name]}));
   //create output array
   let eLinksArray = [];
  //create objects for project_links array, skipping empty fields
    eLinks.forEach(function(item) {
      if(!_.isEmpty(item.linkUrl)) {
        item.linkUrl = url.appendHttpIfMissingProtocol(item.linkUrl);
        eLinksArray.push({
          linkName: item.linkName,
          linkUrl: item.linkUrl,
          visibility: "PUBLIC",
        })
      }
    });
    //combine arrays prior to sending to backend
    let formFields = this.state.formFields;
    formFields.project_links = formFields.project_links.concat(eLinksArray);
    this.setState({ formFields: formFields});
    this.forceUpdate();
  }

  filterSpecificLinks(array) {
    //this function updates the entire state.formFields object at once
    let specificLinks = _.remove(array, function(n) {
      return n.linkName in DefaultLinkDisplayConfigurations;
    });
    //copy the formFields state to work with
    let linkState = this.state.formFields;
    //pull out the link_ item key:values and append to state copy
    specificLinks.forEach(function(item) {
      linkState[item.linkName] = item.linkUrl;
     });
     //add the other links to state copy
     linkState['project_links'] = array;

     //TODO: see if there's a way to do this without the forceUpdate - passing by reference problem?
     this.setState({ formFields: linkState });
     this.forceUpdate();
  }

  render(): React$Node {
    return this.state.error ? this._renderError() : this._renderForm();
  }

  _renderError(): React$Node {
    return (
      <div className="EditProjectForm-error">
        {this.state.error}
      </div>
    );
  }

  _renderLocationSection(): React$Node{
    return (
      <React.Fragment>
        <div className="form-group">
          <label>Country</label>
          <CountrySelector
            id="project_country"
            countryCode={this.state.formFields.project_country && this.state.formFields.project_country.ISO_2}
            countryCodeFormat={CountryCodeFormats.ISO_2}
            onSelection={this.onCountrySelect.bind(this, "project_country")}
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <LocationAutocompleteForm
            country={this.state.formFields.project_country}
            onSelect={this.onFormFieldSelect.bind(this, "project_location")}
            location={this.state.formFields.project_location}
            formInputs={LocationFormInputsByEntity.Projects}
          />
        </div>
      </React.Fragment>
    );
  }

  _renderForm(): React$Node {
    return (
      <div className="EditProjectForm-root create-form white-bg">

        <DjangoCSRFToken/>

        <div className="form-group">
          <div className='text-right'>
            <input disabled={!this.state.formIsValid} type="submit" className="btn btn-success"
                   value="Save Project" onClick={this.onSubmit.bind(this)}/>
          </div>
        </div>
        
        <div className="form-group">
          <ImageCropUploadFormElement form_id="project_thumbnail_location"
                                  buttonText="Upload Project Image"
                                  currentImage={this.state.formFields.project_thumbnail}/>
        </div>

        <div className="form-group">
          <label>Project Name</label>
          <input type="text" className="form-control" id="project_name" name="project_name" maxLength="60"
                 value={this.state.formFields.project_name} onChange={this.onFormFieldChange.bind(this, "project_name")}/>
        </div>

        {this._renderLocationSection()}

        <div className="form-group">
          <label htmlFor="project_url">Website URL</label>
          <input type="text" className="form-control" id="project_url" name="project_url" maxLength="2075"
                 value={this.state.formFields.project_url} onChange={this.onFormFieldChange.bind(this, "project_url")}/>
        </div>


        <div className="form-group">
          <label>Community</label>
          <TagSelector
            elementId="project_organization"
            value={this.state.formFields.project_organization}
            category={TagCategory.ORGANIZATION}
            allowMultiSelect={true}
            onSelection={this.onTagChange.bind(this, "project_organization")}
          />
        </div>

        <div className="form-group">
          <label>Organization Type</label>
          <TagSelector
            elementId="project_organization_type"
            value={this.state.formFields.project_organization_type}
            category={TagCategory.ORGANIZATION_TYPE}
            allowMultiSelect={false}
            onSelection={this.onTagChange.bind(this, "project_organization_type")}
          />
        </div>

        <div className="form-group">
          <label>Issue Area</label>
          <TagSelector
            elementId="project_issue_area"
            value={this.state.formFields.project_issue_area}
            category={TagCategory.ISSUES}
            allowMultiSelect={false}
            onSelection={this.onTagChange.bind(this, "project_issue_area")}
          />
        </div>

        <div className="form-group">
          <label>Technology Used</label>
          <TagSelector
            elementId="project_technologies"
            value={this.state.formFields.project_technologies}
            category={TagCategory.TECHNOLOGIES_USED}
            allowMultiSelect={true}
            onSelection={this.onTagChange.bind(this, "project_technologies")}
          />
        </div>

        <div className="form-group">
          <label>Project Stage</label>
          <TagSelector
            elementId="project_stage"
            value={this.state.formFields.project_stage}
            category={TagCategory.PROJECT_STAGE}
            allowMultiSelect={false}
            onSelection={this.onTagChange.bind(this, "project_stage")}
          />
        </div>

        <div className="form-group">
          <label>
            Short Description
          </label>
          <div className="character-count">
            { (this.state.formFields.project_short_description || "").length} / 140
          </div>
          <textarea className="form-control" id="project_short_description" name="project_short_description"
                    placeholder="Give a one-sentence description of this project" rows="2" maxLength="140"
                    value={this.state.formFields.project_short_description} onChange={this.onFormFieldChange.bind(this, "project_short_description")}>
          </textarea>
        </div>

        <div className="form-group">
          <label>
            Problem*
            {
              window.PROJECT_DESCRIPTION_EXAMPLE_URL
                ? (
                  <a className="label-hint create-form-project-example" target="_blank" rel="noopener noreferrer" href={_.unescape(window.PROJECT_DESCRIPTION_EXAMPLE_URL)}>
                    (Example)
                  </a>
                )
                : null
            }
          </label>
          <div className="character-count">
            { (this.state.formFields.project_description || "").length} / 3000
          </div>
          <textarea className="form-control" id="project_description" name="project_description"
                    placeholder="Describe the problem your project is solving..." rows="6" maxLength="3000"
                    value={this.state.formFields.project_description} onChange={this.onFormFieldChange.bind(this, "project_description")}>
          </textarea>
          *Required
        </div>

        <div className="form-group">
          <label>
            Solution
          </label>
          <div className="character-count">
            { (this.state.formFields.project_description_solution || "").length} / 1000
          </div>
          <textarea className="form-control" id="project_description_solution" name="project_description_solution"
                    placeholder="Describe the solution you plan to build..." rows="6" maxLength="1000"
                    value={this.state.formFields.project_description_solution} onChange={this.onFormFieldChange.bind(this, "project_description_solution")}>
          </textarea>
        </div>

        <div className="form-group">
          <label>
            Action(s)
          </label>
          <div className="character-count">
            { (this.state.formFields.project_description_actions || "").length} / 1000
          </div>
          <textarea className="form-control" id="project_description_actions" name="project_description_actions"
                    placeholder="Describe the actions that needed to be token..." rows="6" maxLength="1000"
                    value={this.state.formFields.project_description_actions} onChange={this.onFormFieldChange.bind(this, "project_description_actions")}>
          </textarea>
        </div>

        <div className="form-group">
          <label htmlFor="link_coderepo">Code Repository <span className="label-hint">(e.g. Github)</span></label>
          <input type="text" className="form-control" id="link_coderepo" name="link_coderepo" maxLength="2075"
                 value={this.state.formFields.link_coderepo} onChange={this.onFormFieldChange.bind(this, "link_coderepo")}/>
        </div>

        <div className="form-group">
          <label htmlFor="link_messaging">Messaging <span className="label-hint">(e.g. Slack)</span></label>
          <input type="text" className="form-control" id="link_messaging" name="link_messaging" maxLength="2075"
                 value={this.state.formFields.link_messaging} onChange={this.onFormFieldChange.bind(this, "link_messaging")}/>
        </div>

        <div className="form-group">
          <label htmlFor="link_projmanage">Project Management <span className="label-hint">(e.g. Trello)</span></label>
          <input type="text" className="form-control" id="link_projmanage" name="link_projmanage" maxLength="2075"
                 value={this.state.formFields.link_projmanage} onChange={this.onFormFieldChange.bind(this, "link_projmanage")}/>
        </div>

        <div className="form-group">
          <label htmlFor="link_filerepo">File Repository <span className="label-hint">(e.g. Google Drive)</span></label>
          <input type="text" className="form-control" id="link_filerepo" name="link_filerepo" maxLength="2075"
                 value={this.state.formFields.link_filerepo} onChange={this.onFormFieldChange.bind(this, "link_filerepo")}/>
        </div>

        <div className="form-group">
          <PositionList elementid="project_positions" positions={this.state.formFields.project_positions}/>
        </div>

        <div className="form-group">
          <LinkList elementid="project_links" title="Project Links" links={this.state.formFields.project_links}/>
        </div>

        <div className="form-group">
          <FileUploadList elementid="project_files" title="Project Files" files={this.state.formFields.project_files}/>
        </div>

        <FormValidation
          validations={this.state.validations}
          onValidationCheck={this.onValidationCheck.bind(this)}
          formState={this.state.formFields}
        />
        <div className="form-group">
          <div className='text-right'>
            <input disabled={!this.state.formIsValid} type="submit" className="btn btn-success"
                   value="Save Project" onClick={this.onSubmit.bind(this)}/>
          </div>
        </div>
      </div>
    );
  }
}

export default EditProjectForm;
