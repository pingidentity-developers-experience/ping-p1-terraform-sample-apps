// Packages
import React from 'react';

// Styles
import "./AccountsDropdown.scss";

const AccountsDropdown = (props) => {
  
  return (
    <div className="accounts-dropdown">
      { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
      <a href="#">{props.text}</a>
    </div>
  );
};

export default AccountsDropdown;
