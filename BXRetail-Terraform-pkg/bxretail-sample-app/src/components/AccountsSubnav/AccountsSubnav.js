// Packages
import React, { useState } from 'react';
import { Collapse } from 'reactstrap';
import { Link } from 'react-router-dom'

// Styles
import "./AccountsSubnav.scss";

const AccountsSubnav = (props) => {
  
  const [isOpen, setIsOpen] = useState(props.subnav.open);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="accounts-subnav">
      <Link to={props.subnav.href} onClick={toggle}>{props.subnav.title}</Link>
      { props.subnav.links && 
        <Collapse isOpen={isOpen}>
          <hr />
          <nav>
            <ul>
              {
                Object.keys(props.subnav.links).map(key => {
                  return (
                    <li key={key}><Link to={props.subnav.links[key].href} className={ props.subnav.links[key].active ? "active" : "" }>{props.subnav.links[key].title}</Link></li>
                  );
                })      
              }
            </ul>
          </nav>
        </Collapse>
      }
    </div>
  );
};

export default AccountsSubnav;
