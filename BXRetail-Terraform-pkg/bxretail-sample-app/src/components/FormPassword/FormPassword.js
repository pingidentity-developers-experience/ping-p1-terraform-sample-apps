// Packages
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input} from 'reactstrap';

// Styles
import "./FormPassword.scss";

class FormPassword extends React.Component {

  /* constructor(props) {
    super(props);
  } */
  componentDidMount () {
    const eye = document.querySelectorAll(".icon-eye");
    const inputEye = document.querySelectorAll(".form-password > input");

    for(var i=0; i < eye.length; i++){
      eye[i].addEventListener('mousedown', function(e){
        let idx;
        inputEye.forEach((currentValue, currentIndex) => {
          if (currentValue.id === e.target.name) {
            idx = currentIndex;
          }
        });
        inputEye[idx].type = "text";
      });  
      eye[i].addEventListener('mouseup', function(e){
        let idx;
        inputEye.forEach((currentValue, currentIndex) => {
          if (currentValue.id === e.target.name) {
            idx = currentIndex;
          }
        });
        inputEye[idx].type = "password";
      });
    }
  }
  render() {
    return (
      <FormGroup className="form-group-light form-password" >
        <Label for="password">{this.props.label}</Label>
        <img src={window._env_.PUBLIC_URL + "/images/icons/password-hide.svg"} alt="password" name={this.props.name} className="icon-eye" style={this.props.style} />
        <Input onChange={this.props.handleFormInput} required autoComplete="off" type="password" name={this.props.name} id={this.props.name} placeholder={this.props.placeholder} value={this.props.value} pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!.,%*?&])[A-Za-z\d@$!.,%*?&]{8,}$" title="Must contain 8 or more characters that are of at least one number, and one uppercase, one lowercase letter, and one or more of the following special characters @$!.,%*?&."/>
      </FormGroup>
    );
  }
};

FormPassword.propTypes = {
  label: PropTypes.string,
  style: PropTypes.object,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  handleFormInput: PropTypes.func.isRequired
}

export default FormPassword;
