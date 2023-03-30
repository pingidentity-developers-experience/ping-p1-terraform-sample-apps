import React from 'react';
import PropTypes from 'prop-types';
import './LoginLinkButton.scss';

class LoginLinkButton extends React.Component {
    render() {
        return (
            <div onClick={this.props.clickHandler} className="login-link-button" style={{ color: this.props.color || '#ffffff', backgroundColor: this.props.backgroundColor}}>
                <div className="login-link-button-icon">{this.props.icon}</div>
                <div className="login-link-button-text">{this.props.text}</div>
            </div>
        );
    }
}

LoginLinkButton.propTypes = {
    clickHandler: PropTypes.func.isRequired,
    color: PropTypes.string,
    backgroundColor: PropTypes.string, 
    icon: PropTypes.element,
    text: PropTypes.string
}

export default LoginLinkButton;