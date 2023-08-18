import React,{useState} from 'react';
import Axios from 'axios'
import {useHistory} from 'react-router-dom'
import '../App.css'

function CreateUser() {

const [userName,setUserName] = useState("");
const [password,setPassword] = useState("");
const [name,setName] = useState("");
let history=useHistory();
const submit = (e) => {
    e.preventDefault()
    Axios.post('http://localhost:3002/api/create', {UserName: userName, Password: password, Name:name})
    history.push("/");
}

    return (
        <div className="CreateUser">
            <form action="" method="get" onSubmit={submit} className="uploadUser">
            <h1 >Registration Form</h1> 
                <label>Name</label>
                <input type="text" required pattern="[A-Za-z]{1,64}" onChange={(e)=> {
                    setName(e.target.value)
                }}/>
                <label>Username: </label>
                <input type="text" required pattern="[A-Za-z0-9]{1,64}" onChange={(e)=> {
                    setUserName(e.target.value)
                }}/>
                <label>Password: </label>
                <input type="password" required pattern=".{8,32}" onChange={(e)=>{
                    setPassword(e.target.value)
                }}/>
<button type='submit'>Submit</button>
            </form>
        </div>
    )
}

export default CreateUser
