import React, { useState } from "react";
import firebase from "firebase";
import { storage, db } from "./firebase";
import "./ImageUpload.css";
import { Input, Button } from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";

const ImageUpload = ({ username, setModalOpen }) => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState("");

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    //get a reference, access the storage in firebase
    //put image put the image you just selected to the
    if (image) {
      //build a unique name
      const imageFileName = uuidv4().concat("-", image.name);
      const uploadTask = storage.ref(`images/${imageFileName}`).put(image);
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
          // complete function ...
          storage
            .ref("images") //go to the image folder
            .child(imageFileName) //go to the image.name file
            .getDownloadURL() //and then get the downloading file
            .then((url) => {
              setUrl(url);

              // post image inside db
              db.collection("posts")
                .add({
                  imageUrl: url,
                  caption: caption,
                  username: username,
                  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                })
                .then((doc) => {
                  db.collection("users")
                    .doc(username)
                    .collection("postIds")
                    .doc(doc.id)
                    .set({
                      postId: doc.id,
                    });
                });

              setProgress(0);
              setCaption("");
              setImage(null);
            });
        }
      );
    } else if (caption.trim() !== "") {
      db.collection("posts")
        .add({
          caption: caption,
          username: username,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then((doc) => {
          db.collection("users")
            .doc(username)
            .collection("postIds")
            .doc(doc.id)
            .set({
              postId: doc.id,
            });
        });
      setCaption("");
    } else {
    }
    if (setModalOpen) {
      setModalOpen(false);
    }
  };

  return (
    <div className="imageupload">
      <progress className="imageupload__progress" value={progress} max="100" />
      <Input
        placeholder="Enter a caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <div>
        <input type="file" onChange={handleChange} />
        <Button className="imageupload__button" onClick={handleUpload}>
          Upload
        </Button>
      </div>

      <br />
    </div>
  );
};

export default ImageUpload;
