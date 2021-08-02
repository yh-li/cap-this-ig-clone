import React, { useState, useEffect } from "react";
import "./App.css";
import Post from "./Post";
import ImageUpload from "./ImageUpload";
import { db, auth } from "./firebase";
import {
  Button,
  Avatar,
  makeStyles,
  Modal,
  Input,
  IconButton,
} from "@material-ui/core";
import FlipMove from "react-flip-move";
import ProfileIcon from "./ProfileIcon";

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

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  //useEffect runs a piece of code based on a specific condition
  //if we leave the conditions as blank
  //it will run once when the component loads
  //useEffect(()=>{
  //this is the callback function, or the code that will run
  //}),[INSIDE ARE CONDITIONS])
  //if we leave [posts] there as conditions, it will run
  //everytime [posts] changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      //listen for any single time any authentication changes
      //like login, logout
      //console.log("Auth State Change.");
      if (authUser) {
        // user is logged in...
        setUser(authUser);
      } else {
        //use logged out
        setUser(null);
      }
    });

    return () => {
      //perform some clean up actions when user or username changes
      unsubscribe();
    };
  }, [user, username]);

  //console.log(db.collection("posts").orderBy("timestamp", "desc"));
  useEffect(() => {
    //db is from firebase
    db.collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({ id: doc.id, post: doc.data() }))
        );
      });
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message));

    setOpen(false);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch((error) => alert(error.message));
    setRegisterOpen(false);
  };
  return (
    <div className="app">
      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app__login">
            <center>
              <img className="app__headerImage" src="capThisLogo.png" alt="" />
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
          <form className="app__login">
            <center>
              <img className="app__headerImage" src="capThisLogo.png" alt="" />
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
      <div className="app__header">
        <img className="app__headerImage" src="capThisLogo.png" alt="" />
        {user?.displayName ? (
          <div className="app__headerRight">
            <Button onClick={() => auth.signOut()}>Logout</Button>
            <ProfileIcon user={user} />
          </div>
        ) : (
          <form className="app__loginHome">
            <Button onClick={() => setOpen(true)}>Login</Button>
            <Button onClick={() => setRegisterOpen(true)}>Sign Up</Button>
          </form>
        )}
      </div>

      {/* <Post
        user="d"
        key={23123123}
        postId={""}
        username={"helloya"}
        caption={"captionThis!"}
        imageUrl="https://support-wildrift.riotgames.com/hc/article_attachments/360104660413/WR_LuxTrial_EventArticle_Banner.jpg"
      />
      <Post
        user="d"
        key={23123123}
        postId={""}
        username={"helloya"}
        caption={"captionThis!"}
        imageUrl="https://static.wikia.nocookie.net/leagueoflegends/images/f/f4/Lux_Render.png/revision/latest?cb=20200209203614"
      /> */}
      <div className="app__posts">
        <div className="app__postsLeft">
          <FlipMove>
            {posts.map(({ id, post }) => {
              return (
                <Post
                  user={user}
                  key={id}
                  postId={id}
                  username={post.username}
                  caption={post.caption}
                  imageUrl={post.imageUrl}
                  curUser={user}
                />
              );
            })}
          </FlipMove>
        </div>
      </div>

      {user?.displayName ? (
        <div className="app__upload">
          <ImageUpload username={user.displayName} />
        </div>
      ) : (
        <center>
          <h3>Login to upload</h3>
        </center>
      )}
    </div>
  );
}

export default App;
