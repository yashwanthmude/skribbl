import React,{useEffect,useState} from 'react'
import {useHistory} from 'react-router-dom';
import 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css'
import axios from 'axios';

export default function Login({ setToken }) {
    const [username, setUserName] = useState();
    const [password, setPassword] = useState();
    let history=useHistory();
    const handleSubmit=(e) => {
        e.preventDefault();
        axios.post('http://localhost:3002/api/login',{username:username,password:password}).then((response)=>{
            console.log(response);
            if(response.data.length>0){
                let id=response.data[0].Id;
                history.push(`/${username}/${id}`)
            }
            else{
                alert("Invalid User");
            }
        })
    }
    const handleRegister=(e)=>{
        e.preventDefault();
        history.push(`/register`);
    }

    return (
        <div className="CreateUser">
            <button className="btn-btn-blue" onClick={handleRegister}>Register</button>
            <form action="" className="uploadUser" onSubmit={handleSubmit}>
            <h1 >Login Form</h1> 
                <label>Username: </label>
                <input type="text" required pattern="[A-Za-z0-9]{1,20}" onChange={e => setUserName(e.target.value)}/>
                <label>Password: </label>
                <input type="password" required pattern=".{1,20}" onChange={e => setPassword(e.target.value)}/>
            <button type='submit'  >Login</button>
            </form>
        </div>
    )
}
