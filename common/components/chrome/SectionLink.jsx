// @flow

import type {SectionType} from '../enums/Section.js';

import cx from '../utils/cx';
import UniversalDispatcher from '../stores/UniversalDispatcher.js';
import React from 'react';
import url from '../utils/url.js';
import Section from '../enums/Section.js';
import metrics from "../utils/metrics.js";

type Props = {|
  +activeSection: SectionType,
  +section: SectionType,
  +title: string,
  +showOnlyWhenLoggedIn: SectionType
|};

class SectionLink extends React.PureComponent<Props> {

  _cx: cx;

  constructor(): void {
    super();
    this._cx = new cx('SectionLink-');
  }

  render(): React$Node {
    return (
      <div
        className={this._cx.get(...this._getClassNames())}
        onClick={this._onChangeSection.bind(this)}
        >
        <h3>{this.props.title}</h3>
      </div>
    );
  }

  _getClassNames(): $ReadOnlyArray<string> {
    return this.props.section === this.props.activeSection
      ? ['root', 'active']
      : ['root'];
  }

  _onChangeSection(): void {
    UniversalDispatcher.dispatch({
      type: 'SET_SECTION',
      section: this.props.section,
      url: url.section(this.props.section)
    });
    window.scrollTo(0,0);
    metrics.logSectionNavigation(this.props.section);
  }
}

export default SectionLink;
