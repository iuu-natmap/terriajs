'use strict';

import ObserveModelMixin from '../ObserveModelMixin';
import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Styles from './feedback-button.scss';
import Icon from "../Icon.jsx";

const FeedbackButton = createReactClass({
    displayName: 'FeedbackButton',
    mixins: [ObserveModelMixin],

    propTypes: {
        terria: React.PropTypes.object,
        viewState: PropTypes.object.isRequired
    },

    componentWillMount() {
        this.surveyLink = this.props.terria.configParameters.surveyLink;
    },

    render() {
        return (
            <div className={Styles.feedback}>
                <a href={this.surveyLink} target="_blank" className={Styles.btnFeedback}>
                    <Icon glyph={Icon.GLYPHS.feedback}/>
                    <span>Give feedback</span>
                </a>
            </div>
        );
    },
});

module.exports = FeedbackButton;
