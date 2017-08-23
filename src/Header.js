import React, {Component} from 'react';
import { Link } from 'react-router'
import './App.css';
import { Menu } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

class Header extends Component {
    state = {};

    handleItemClick = (e, { name }) => { this.setState({ activeItem: name }); }

    render() {
        const { activeItem } = this.state

        return (
            <Menu>
                <Menu.Item as={ Link }
                name='simple'
                to="/"
                active={activeItem === 'simple'}
                onClick={this.handleItemClick}
                >
                 Simplest 
                </Menu.Item>

                <Menu.Item as={ Link }
                name='medium'
                to="/medium"
                active={activeItem === 'medium'}
                onClick={this.handleItemClick}
                >
                Medium
                </Menu.Item>

                <Menu.Item as={ Link }
                name='tough'
                to="/tough"
                active={activeItem === 'tough'}
                onClick={this.handleItemClick}
                >
                Toughest
                </Menu.Item>
            </Menu>
        );
    }
    // return (
    //     <div>
    //         <div>
    //             <Link to='/'>Simplest</Link>&nbsp;
    //             <Link to='/medium'>Medium</Link>
    //             <Link to='/tough'>Toughest</Link>
    //         </div>
    //         <div className="App-header">
    //             <h2>Collect all the Mammals</h2>
    //         </div>
    //     </div>    
    // );
}

export default Header;