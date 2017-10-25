import React, { Component } from 'react';

class Alien extends Component {
    getClassNames(){
        if(this.props.explode){
            return 'App--Game--Alien App--Game--Explode';
        }
        return 'App--Game--Alien App--Game--Alien-Animation';
        
    }
    render() {
        let styles = {
            top: this.props.alienTop,
            left: this.props.alienLeft,
            width: this.props.alienWidth,
            height: this.props.alienHeight
        }
        return (
            <div className={this.getClassNames()}
            style={styles}

            >
            </div>
        );
    }
}

export default Alien;