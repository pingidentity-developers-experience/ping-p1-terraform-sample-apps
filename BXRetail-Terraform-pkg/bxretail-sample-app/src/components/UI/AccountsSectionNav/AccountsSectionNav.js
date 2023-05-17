// Packages
import React from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom'
import classNames from "classnames";

// Styles
import "./AccountsSectionNav.scss";

const AccountsSectionNav = (props) => {
  
  return (
    <div className={classNames("accounts-section-nav", { "white": props.content.white }, { "curved": props.content.curved })}>
      <div className="accounts-section-nav-text">
        <h4>{props.content.title}</h4>
        <p dangerouslySetInnerHTML={{__html: props.content.description}}></p>
      </div>
      {props.content.button_href && 
        <Link to={props.content.button_href}><Button color="primary">{props.content.button_text}</Button></Link>
      }
      {props.content.welcome && 
        <div>
          <hr />
        </div>
      }
    </div>
  );
};

export default AccountsSectionNav;
