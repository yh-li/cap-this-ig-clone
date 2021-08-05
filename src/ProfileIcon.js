import React, { useState } from "react";
import "./ProfileIcon.css";
import {
  Avatar,
  Button,
  IconButton,
  Modal,
  makeStyles,
} from "@material-ui/core";
import firebase from "firebase";
import { storage, db } from "./firebase";
function ProfileIcon({ username }) {
  const [modalStyle] = useState(getModalStyle);
  const [avatarOpen, setAvatarOpen] = useState(false);
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
  const classes = useStyles();
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
  const [avatar, setAvatar] = useState(null);
  const [url, setUrl] = useState("/static/images/avatar/1.jpg");
  const [progress, setProgress] = useState(0);
  console.log("Avatar rerenders");
  if (username) {
    db.collection("avatars")
      .doc(username)
      .collection("avatarUrls")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.docs.map((doc) => {
            setUrl(doc.data().avatarUrl);
          });
        } else {
          console.log("No avatar from Profile Icon");
        }
      })
      .catch((err) => {
        setUrl("/");
      });
  }
  const handleChange = (e) => {
    if (e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    //get a reference, access the storage in firebase
    //put avatar put the avatar you just selected to the
    if (avatar) {
      const uploadTask = storage.ref(`avatars/${avatar.name}`).put(avatar);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // progress function ...
          const progress = Math.round(
            //a percentage upload progress
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            //for visualizing the upload progress
          );
          setProgress(progress);
        },
        (error) => {
          // Error function ...
          console.log(error);
        },
        () => {
          storage
            .ref("avatars") //go to the avatar folder
            .child(avatar.name) //go to the avatar.name file
            .getDownloadURL() //and then get the downloading file
            .then((url) => {
              setUrl(url);
              // complete function ...
              console.log(url);
              // post avatar inside db
              db.collection("avatars")
                .doc(username)
                .collection("avatarUrls")
                .add({
                  avatarUrl: url,
                  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                });

              setProgress(0);
              setAvatar(null);
              setAvatarOpen(false);
            });
        }
      );
    }
  };
  return (
    <div>
      <IconButton
        onClick={() => {
          setAvatarOpen(true);
        }}
      >
        <Avatar className="app__headerAvatar" alt={username} src={url} />
      </IconButton>
      <Modal open={avatarOpen} onClose={() => setAvatarOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app__setAvatar">
            <div className="avatar">
              <progress
                className="avatarupload__progress"
                value={progress}
                max="100"
              />
              <div>
                <input type="file" onChange={handleChange} />
                <Button className="avatarupload__button" onClick={handleUpload}>
                  Set a profile image...
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default ProfileIcon;
