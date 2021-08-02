import React, { useState } from "react";
import "./UploadAvatar.css";
import firebase from "firebase";
import { storage, db } from "./firebase";
import { Button } from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";
function UploadAvatar({ username }) {
  const [avatar, setAvatar] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const handleChange = (e) => {
    if (e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    //get a reference, access the storage in firebase
    //put avatar put the avatar you just selected to the
    if (avatar) {
      const uploadTask = storage
        .ref(`avatars/${uuidv4()}-${avatar.name}`)
        .put(avatar);
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
              db.collection("avatars").add({
                avatarUrl: url,
                username: username,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              });

              setProgress(0);
              setAvatar(null);
            });
        }
      );
    }
  };
  return (
    <div className="avatar">
      <progress className="avatarupload__progress" value={progress} max="100" />
      <div>
        <input type="file" onChange={handleChange} />
        <Button className="avatarupload__button" onClick={handleUpload}>
          Set a profile image...
        </Button>
      </div>
    </div>
  );
}

export default UploadAvatar;
