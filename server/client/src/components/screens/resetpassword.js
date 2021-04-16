import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'
import M from 'materialize-css'

const ResetPassword = () => {
    
    const history = useHistory()
    const [email, setEmail] = useState("")

    const postData = () => {
        // eslint-disable-next-line
        const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/       
        if (!regex.test(email)){
            M.toast({html:"Invalid Email", classes:"toastClass toastError", displayLength:"2000"})
            return
        }
        fetch('/reset-password',{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                email
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
                <i className="fas fa-envelope fa-sm ml-1 toInline"></i>
                <input 
                    className="inp ml-1 toInline" 
                    type="text" 
                    placeholder="Email" 
                    style={{width: "311px"}}
                    value={email}
                    onChange={ e => setEmail(e.target.value)}
                /><br /><br />              
                <button 
                    className="btn btn-sm mt-3 mb-1 btn-primary float-right" 
                    style={{borderRadius:"0"}}
                    onClick={ () => postData() }    
                >Reset password</button>              
            </div>
        </div>
    )
}

export default ResetPassword