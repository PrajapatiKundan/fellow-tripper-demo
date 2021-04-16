import React, {useContext, useRef, useEffect, useState} from 'react';
import { Link, useHistory } from 'react-router-dom'
import {UserContext} from '../App'
import M from 'materialize-css'

const Navbar = () => {
    
    const {state, dispatch} = useContext(UserContext)
    const history = useHistory()
    const searchModal = useRef(null)
    const [searchData, setSearchData] = useState('')
    const [foundUsers, setFoundUsers] = useState([])

    useEffect(()=>{
        M.Modal.init(searchModal.current)
    }, [])
    
    const renderList = () => {
        if(state){
            return ([
                <li key="0" >
                    <i data-target="modal1" className="fa fa-search modal-trigger" style={{ color: 'white',paddingTop:'13px', cursor:"pointer"}}></i>
                </li>,
                <li className="nav-item active" key="1">
                    <Link className="nav-link" to={state ? "/":"/signin"}>Home</Link>
                </li>,
                <li className="nav-item active" key="2">
                <Link className="nav-link" to="/subscribeduserposts">My-Following-Posts</Link>
                </li>,
                <li className="nav-item active" key="3">
                    <Link className="nav-link" to="/profile">Profile</Link>
                </li>,
                <li className="nav-item active" key="4">
                    <Link className="nav-link" to="/createpost">Create-Post</Link>
                </li>,
                <li className="nav-item active" key="5">
                    <button 
                        className="btn btn-sm btn-outline-light" 
                        style={{ marginTop:"4px"}}
                        onClick={ () => {
                            localStorage.clear()
                            dispatch({type:"LOGOUT"})
                            history.push("/signin")
                        } }    
                    >Log out</button>
                </li>
            ])
        }else{
            return ([
                <li className="nav-item active" key="1">
                    <Link className="nav-link" to="/signin">Login</Link>
                </li>,
                <li className="nav-item active" key="2">
                    <Link className="nav-link" to="/signup">SignUp</Link>
                </li>
            ])
        }
    }

    const handleUserSearch = (query) => {
        if(query === ""){
            setFoundUsers([])
            setSearchData('')
            return
        }
        setSearchData(query)
        fetch('/search-user', {
            method:"post",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query
            })
        })
        .then( res => res.json())
        .then( results => {
            setFoundUsers(results.users)
        })
        .catch(err => console.log(err))
        
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary"> 
            <Link className="navbar-brand" to={state ? "/":"/signin"}>FellowTripper</Link>        
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                <ul className="navbar-nav ml-auto">
                    { renderList()}
                </ul>  
            </div>
        <div id="modal1" className="modal modalClass" ref = {searchModal} style={{margin: '2px auto'}}>
                <div className="modal-content" style={{border: '2px solid black', borderRadius:'8px'}}>
                    <div className="input-group input-group-sm">
                        <input type="text" style={{margin: '7px 7px', display:'block'}} className="form-control" placeholder="Search user" value={searchData} onChange={ e => handleUserSearch(e.target.value)}/>
                    </div>
                    <ul className="list-group" style={{overflowY: 'scroll', maxHeight:'141px'}}>
                    {
                        foundUsers.map( (item, i) => {
                            return (
                                <Link
                                    style={{textDecoration: 'none', height:'50px'}}
                                    to={item._id !== state._id ? '/profile/'+item._id : '/profile'}
                                    onClick={()=>{
                                        M.Modal.getInstance(searchModal.current).close()
                                        setSearchData('')
                                        setFoundUsers([])
                                    }}
                                    key={i}
                                >
                                    <li style = {{display:'inline'}}>
                                    <img 
                                        style={{width:"30px", height:"30px", borderRadius:"50%", margin:"8px"}}
                                        src={item.profile_pic}
                                        alt="No profile"
                                    />    
                                    {item.name}</li>
                                    <hr style={{margin:'0px'}}/>
                                </Link>
                            )
                        })
                    }                        
                    </ul>
                    <button className="modal-close btn btn-sm btn-danger " style={{width:'50px', margin:'8px auto'}} onClick={()=>setSearchData('')}>Close</button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar

//Link tag instead of <a> tag is used for single page application