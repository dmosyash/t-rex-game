import React from 'react';
import { Link } from 'react-router'
import './App.css';

const Header = () => {
    return (
        <div>
            <div>
                <Link to='/'>Simplest</Link>&nbsp;
                <Link to='/medium'>Medium</Link>
                <Link to='/tough'>Toughest</Link>
            </div>
            <div className="App-header">
                <h2>Collect all the Mammals</h2>
            </div>
        </div>    
    );
}

export default Header;