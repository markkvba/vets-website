import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import Scroll from 'react-scroll';

import { focusElement } from '../../common/utils/helpers';

const scroller = Scroll.scroller;
const scrollToTop = () => {
  scroller.scrollTo('topScrollElement', {
    duration: 500,
    delay: 0,
    smooth: true,
  });
};

class ConfirmationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isExpanded: false };
  }

  componentDidMount() {
    focusElement('.confirmation-page-title');
    scrollToTop();
  }

  toggleExpanded = (e) => {
    e.preventDefault();
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  render() {
    const form = this.props.form;
    const response = this.props.form.submission.response
      ? this.props.form.submission.response.attributes
      : {};
    const name = form.data.veteranFullName;
    const regionalOffice = response.regionalOffice || [];

    let pmcName;
    if (regionalOffice.length) {
      pmcName = regionalOffice[0].replace('Attention:', '').trim();
    }

    return (
      <div>
        <h3 className="confirmation-page-title">Claim received</h3>
        <p>
          We may contact you for more information or documents.<br/>
          <i>Please print this page for your records.</i>
        </p>
        <div className="inset">
          <h4>Veterans Pension Benefit Claim <span className="additional">(Form 21P-527EZ)</span></h4>
          <span>for {name.first} {name.middle} {name.last} {name.suffix}</span>

          <ul className="claim-list">
            <li>
              <strong>Date received</strong><br/>
              <span>{moment(form.submission.submittedAt).format('MMM D, YYYY')}</span>
            </li>
            <li>
              <strong>Confirmation number</strong><br/>
              <span>{response.confirmationNumber}</span>
            </li>
            <li>
              <strong>Pension Management Center</strong><br/>
              <span>{pmcName}</span><br/>
              <span>Phone: <a href="tel:+1-800-827-1000">800-827-1000</a></span><br/>
              <span>Fax: <a href="tel:+1-844-655-1604">844-655-1604</a></span>
            </li>
            <li>
              <span>If you have several documents to send in, you can mail them to:</span>
              <address className="schemaform-address-view">{regionalOffice.map((line, index) =>
                <p key={index}>{line}</p>)}</address>
            </li>
            <li>
              <strong>Note:</strong> If you choose to mail your documents, you don't have to send in a paper copy of VA Form 21P-527EZ with these documents.
            </li>
          </ul>
        </div>
        <p>Need help? If you have questions, call <a href="tel:+1-800-827-1000">800-827-1000</a>, Monday - Friday, from 8:00 a.m. - 9:00 p.m. ET. Please have your Social Security number or VA file number ready. For Telecommunication Relay Services, dial <a href="tel:711">711</a>.</p>
        <div className="row form-progress-buttons schemaform-back-buttons">
          <div className="small-6 usa-width-one-half medium-6 columns">
            <a href="/">
              <button className="usa-button-primary">Go Back to Vets.gov</button>
            </a>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    form: state.form
  };
}

export default connect(mapStateToProps)(ConfirmationPage);
export { ConfirmationPage };
