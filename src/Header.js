import React, { useEffect, useState } from "react";
import "./Header.css";
import { db, auth } from "./firebase";
import {
  Button,
  Avatar,
  makeStyles,
  Modal,
  Input,
  IconButton,
} from "@material-ui/core";
import ProfileIcon from "./ProfileIcon";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import { Link } from "react-router-dom";
import ImageUpload from "./ImageUpload";
function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    height: "300px",
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    height: 200,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));
function Header({ setHomeUserName, loginOpen, setLoginOpen }) {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(loginOpen);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      //listen for any single time any authentication changes
      //like login, logout
      console.log("Auth State Change.");
      if (authUser) {
        // user is logged in...
        setUser(authUser);
        if (authUser.displayName) {
          console.log(authUser.displayName);
          console.log("Signed in");
          setHomeUserName(authUser.displayName);
        } else {
          console.log("New user signed in");
        }
      } else {
        //use logged out
        setUser(null);
        setHomeUserName(null);
      }
    });

    return () => {
      //perform some clean up actions when user or username changes
      unsubscribe();
    };
  }, [user, username]);
  const handleLogin = (e) => {
    e.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .then((authUser) => {
        setHomeUserName(authUser.user.displayName);
      })
      .catch((error) => alert(error.message));

    setOpen(false);
    setLoginOpen(false);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("New Register");
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        //console.log(authUser);
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .then(() => {
        db.collection("users").doc(auth.currentUser.displayName).set({
          username: auth.currentUser.displayName,
          uid: auth.currentUser.uid,
        });
        setHomeUserName(auth.currentUser.displayName);
      })
      .catch((error) => alert(error.message));

    setRegisterOpen(false);
  };
  const handleUpload = (e) => {
    e.preventDefault();
  };
  useEffect(() => {
    console.log("Header's open has been reset to ", open);
  }, [open]);
  return (
    <div className="header">
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setLoginOpen(false);
        }}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="home__login">
            <center>
              <img className="home__headerImage" src="capThisLogo.png" alt="" />
            </center>

            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleLogin}>Login</Button>
          </form>
        </div>
      </Modal>

      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="home__login">
            <center>
              <img className="home__headerImage" src="capThisLogo.png" alt="" />
            </center>
            <Input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleRegister}>Register</Button>
          </form>
        </div>
      </Modal>
      <Modal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
        }}
      >
        <div style={modalStyle} className={classes.paper}>
          upload something. please. {user?.displayName}
          <ImageUpload
            username={user?.displayName}
            setModalOpen={setUploadOpen}
          />
        </div>
      </Modal>
      <div className="home__header">
        <Link to="/">
          {" "}
          <img className="home__headerImage" src="/capThisLogo.png" alt="" />
        </Link>
        {user?.displayName ? (
          <div className="home__headerRight">
            <IconButton
              onClick={() => {
                setUploadOpen(true);
              }}
            >
              <AddAPhotoIcon />
            </IconButton>
            <Button
              onClick={() => {
                auth.signOut();
                console.log("SIGN OUT!");
              }}
            >
              Logout
            </Button>
            <ProfileIcon username={user.displayName} />
          </div>
        ) : (
          <form className="home__loginHome">
            <Button
              onClick={() => {
                setOpen(true);
                setLoginOpen(true);
              }}
            >
              Login
            </Button>
            <Button onClick={() => setRegisterOpen(true)}>Sign Up</Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Header;
