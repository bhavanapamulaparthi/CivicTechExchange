// @flow

import React from 'react';
import moment from 'moment';
import Button from 'react-bootstrap/Button';
import CurrentUser from "../../utils/CurrentUser.js";
import {EventData} from "../../utils/EventAPIUtils.js";
import urlHelper from "../../utils/url.js";
import Section from "../../enums/Section";
import ProjectCardsContainer from "../FindProjects/ProjectCardsContainer.jsx";
import ProjectSearchDispatcher from "../../stores/ProjectSearchDispatcher.js";
import _ from "lodash";


type Props = {|
  event: ?EventData,
  viewOnly: boolean
|};

type State = {|
  event: ?EventData
|};

class AboutEventDisplay extends React.PureComponent<Props, State> {
  constructor(props: Props): void{
    super();
    this.state = {
      event: props.event
    };

    if(this.state.event) {
      this.filterProjectsByOrgTag();
    }
 }

  componentWillReceiveProps(nextProps: Props): void {
    if(nextProps.event !== this.props.event) {
      this.setState({
        event: nextProps.event
      }, this.filterProjectsByOrgTag);
    }
  }

  render(): ?$React$Node {
    const event:EventData = this.state.event;
    return !event ? null : (
      <div className="AboutEvent-root container">

        <div className="AboutEvent-title row">
          <div className="col-12 AboutEvent-header">
          {
            !this.props.viewOnly
            && (CurrentUser.userID() === this.state.event.event_creator || CurrentUser.isStaff())
            && this._renderEditButton()
          }
            <div className="AboutEvent-title-date">
              {moment(event.event_date_start).format("MMMM Do YYYY")}
            </div>
            <h1>{event.event_name}</h1>
            <p>{event.event_short_description}</p>
          </div>
        </div>

        <div className="AboutEvent-EventBanner row">
          <div className="AboutEvent-info col-xs-12 col-lg-4">
            <div className="AboutEvent-info-inner">
              <h3>Info</h3>
              {/*TODO: Handle multi-day events*/}
              <h5 className="AboutEvent-info-header">Date</h5>
              <p>{moment(event.event_date_start).format("dddd, MMMM Do YYYY")}</p>

              <h5 className="AboutEvent-info-header">Time</h5>
              <p>{this._renderTimeRange()}</p>

              <h5 className="AboutEvent-info-header">Location</h5>
              <div className="AboutEvent-location">
                <p>{this.state.event.event_location}</p>
              </div>

              {this.state.event.event_rsvp_url && this._renderRSVPButton()}
              {!this.props.viewOnly && window.EVENT_URL && this._renderJoinLiveEventButton()}
            </div>
          </div>
          <div className="col-xs-12 col-lg-8 AboutEvent-splash">
              <img src={event.event_thumbnail && event.event_thumbnail.publicUrl} />
          </div>
        </div>

        <div className="AboutEvent-details col-12">
          <h3>Details</h3>
          <p>{event.event_description}</p>
          <h3>What We Will Do</h3>
          <p>{event.event_agenda}</p>
        </div>
        {!_.isEmpty(event.event_legacy_organization) && this._renderProjectList()}
      </div>
    )
  }

  _renderTimeRange(): string {
    const timeFormat: string = "h:mm a";
    const timeZone: string = "PST";
    return moment(this.state.event.event_date_start).format(timeFormat) + " - " +
      moment(this.state.event.event_date_end).format(timeFormat) + " " + timeZone;
  }

  _renderEditButton(): ?$React$Node {
    return (
      <Button
        variant="primary"
        className="AboutEvent-edit-btn"
        type="button"
        href={urlHelper.section(Section.CreateEvent, {id: this.state.event.event_id})}
      >
        Edit Event
      </Button>
    );
  }

  _renderRSVPButton(): ?$React$Node {
    return (
      <Button
        variant="primary"
        className="AboutEvent-rsvp-btn"
        type="button"
        href={this.state.event.event_rsvp_url}
      >
        RSVP on Eventbrite
      </Button>
    );
  }

  _renderJoinLiveEventButton(): ?$React$Node {
    let text: string = "";
    let url: string = "";
    if(CurrentUser.isLoggedIn()) {
      //TODO: Handle un-verified users
      text = "Join Event";
      url = urlHelper.section(Section.LiveEvent);
    } else {
      text = "Log In to Join Event";
      url = urlHelper.logInThenReturn();
    }

    return (
      <Button
        variant="success"
        size="lg"
        className="AboutEvent-join-btn"
        type="button"
        title={text}
        href={url}
      >
        {text}
      </Button>
    );
  }

  filterProjectsByOrgTag() {
    const event: EventData = this.state.event;
    if (event && !_.isEmpty(event.event_legacy_organization)) {
      ProjectSearchDispatcher.dispatch({
        type: "INIT",
        findProjectsArgs: {
          org: event.event_legacy_organization[0].tag_name,
          sortField: "project_name"
        },
        searchSettings: {
          updateUrl: false
        }});
    }
  }

  _renderProjectList(): ?$React$Node {
    return (
      <div className="row">
        <ProjectCardsContainer
          showSearchControls={false}
          staticHeaderText="Participating Projects"
          fullWidth={true}
          selectableCards={false}
        />
      </div>
    );
  }
}

export default AboutEventDisplay;
