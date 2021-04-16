import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'
import M from 'materialize-css'

const NewPassword = () => {
    
    const history = useHistory()
    const [password, setPassword] = useState("")
    const [confirm_password, setConfirmPassword] = useState("")
    const { token } = useParams()

    const postData = () => {
        // eslint-disable-next-line
        if(password !== confirm_password){
            M.toast({html:"Passwords are not matching", classes:"toastClass toastError", displayLength:"1500"})
            return
        }
        fetch('/new-password',{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                newPassword:password,
                resetPwdToken: token
            })
        })
        .then( res => res.json())
        .then( data => {
            
            if(data.error){
                M.toast({html:data.error, classes:"toastClass toastError", displayLength:"1500"})
                return
            }else{
                M.toast({html:data.msg, classes:"toastClass toastSuccess", displayLength:"1500"})
                history.push('/signin')
            }
        })
        .catch( err => console.log("Error...", err))
    }

    return (
        <div className="card border-primary mb-3 auth-card" style={{maxWidth: "375px",borderTopWidth: "7px"}}>
            <div className="card-header">KP-insta-clone</div>
            <div className="card-body text-primary">                         
                <i className="fas fa-lock fa-sm ml-1 toInline"></i>
                <input 
                    className="inp ml-1 toInline" 
                    type="password" 
                    placeholder="Enter new password" 
                    style={{width: "311px"}}
                    value={password}
                    onChange={ e => setPassword(e.target.value)}
                /><br /><br />
                <i className="fas fa-lock fa-sm ml-1 toInline"></i>
                <input
                    className="inp ml-1 toInline" 
                    placeholder="Confirm password" 
                    style={{width: "311px"}}
                    type="password" 
                    onChange = { e => setConfirmPassword(e.target.value)}
                    value={confirm_password}
                /><br /><br />

                <button 
                    className="btn btn-sm mt-3 mb-1 btn-primary float-right" 
                    style={{borderRadius:"0"}}
                    onClick={ () => postData() }    
                >Update password</button>              
            </div>
        </div>
    )
}

export default NewPassword