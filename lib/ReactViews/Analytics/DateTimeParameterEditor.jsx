import React from 'react';
import ObserveModelMixin from '../ObserveModelMixin';

const DateTimeParameterEditor = React.createClass({
    mixins: [ObserveModelMixin],
    propTypes: {
        previewed: React.PropTypes.object,
        parameter: React.PropTypes.object,
        viewState: React.PropTypes.object,
        parameterValues: React.PropTypes.object
    },

    getInitialState() {
        const dateTimeBreakOut = {};
        const timeDate = this.props.parameterValues[this.props.parameter.id];
        if (timeDate !== undefined) {
            const splits = timeDate.split('T');
            dateTimeBreakOut.date = splits[0];
            if (splits[1].length === 0) {
                dateTimeBreakOut.time = '00:00';
            } else {
                dateTimeBreakOut.time = splits[1];
            }
        } else {
            dateTimeBreakOut.date = '2000-01-01';
            dateTimeBreakOut.time = '00:00';
        }
        this.props.parameterValues[this.props.parameter.id] = dateTimeBreakOut.date + 'T' + dateTimeBreakOut.time;
        return dateTimeBreakOut;
    },

    onChangeDate(e) {
        const splits = this.props.parameterValues[this.props.parameter.id].split('T');
        this.props.parameterValues[this.props.parameter.id] = e.target.value + 'T' + splits[1];
        this.setState({
            date: e.target.value,
            time: splits[1]
        });
    },

    onChangeTime(e) {
        const splits = this.props.parameterValues[this.props.parameter.id].split('T');
        this.props.parameterValues[this.props.parameter.id] = splits[0] + 'T' + e.target.value;
        this.setState({
            date: splits[0],
            time: e.target.value,
        });
    },

    render() {
        return (<div>
                 <input className='field'
                        type="date"
                        placeholder="YYYY-MM-DD"
                        onChange={this.onChangeDate}
                        value={this.state.date}/>
                 <input className='field'
                        type="time"
                        placeholder="HH:mm:ss.sss"
                        onChange={this.onChangeTime}
                        value={this.state.time}/>
                </div>);
    }
});

module.exports = DateTimeParameterEditor;
