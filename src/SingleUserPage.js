import { Avatar, IconButton, Link } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import Header from "./Header";
import Post from "./Post";
import ProfileIcon from "./ProfileIcon";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import PostList from "./PostList";

function SingleUserPage(props) {
  const [avatar, setAvatar] = useState("");
  const [profileUsername, setProfileUsername] = useState();
  const [loginOpen, setLoginOpen] = useState(false);
  const [viewUsername, setViewUsername] = useState();
  const [postNo, setPostNo] = useState(0);
  const [followerNo, setFollowerNo] = useState(0);
  const [followingNo, setFollowingNo] = useState(0);
  const [followed, setFollowed] = useState();
  const [postIds, setPostIds] = useState();
  /*   useEffect(() => {
    console.log("username changed to ", username);
  }, [username]); */
  useEffect(() => {
    db.collection("users")
      .doc(props.match.params.username)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setProfileUsername(doc.data().username);
        } else {
          setProfileUsername(null);
        }
      });
  }, []);

  useEffect(() => {
    if (profileUsername) {
      db.collection("users")
        .doc(profileUsername)
        .collection("postIds")
        .onSnapshot((snapshot) => {
          setPostNo(snapshot.docs.length);
        });
      db.collection("users")
        .doc(profileUsername)
        .collection("followers")
        .onSnapshot((snapshot) => {
          setFollowerNo(snapshot.docs.length);
        });
      db.collection("users")
        .doc(profileUsername)
        .collection("followings")
        .onSnapshot((snapshot) => {
          setFollowingNo(snapshot.docs.length);
        });
      db.collection("users")
        .doc(profileUsername)
        .collection("postIds")
        .onSnapshot((snapshot) => {
          /*           setPosts(
            snapshot.docs.map((doc) => ({ id: doc.id, post: doc.data() }))
          ); */
          const userPostIds = [];
          snapshot.forEach((doc) => {
            userPostIds.push(doc.id);
          });
          setPostIds(userPostIds);
        });
      //set profile user avatar
      db.collection("avatars")
        .doc(profileUsername)
        .collection("avatarUrls")
        .orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
          if (!querySnapshot.empty) {
            setAvatar(querySnapshot.docs[0].data().avatarUrl);
          } else {
            console.log(
              "No avatar and this is from single post page headline."
            );
          }
        });
    }
  }, [profileUsername]);
  useEffect(() => {
    if (profileUsername) {
      if (viewUsername) {
        db.collection("users")
          .doc(viewUsername)
          .collection("followings")
          .doc(profileUsername)
          .onSnapshot((doc) => {
            if (doc.exists) {
              setFollowed(true);
            } else {
              setFollowed(false);
            }
          });
      } else {
        setFollowed(false);
      }
    }
  }, [profileUsername, viewUsername]);
  const handleFollow = (e) => {
    e.preventDefault();
    console.log("Follow function called");
    if (followed != null) {
      if (followed) {
        //remove them
        db.collection("users")
          .doc(profileUsername)
          .collection("followers")
          .doc(viewUsername)
          .delete();
        db.collection("users")
          .doc(viewUsername)
          .collection("followings")
          .doc(profileUsername)
          .delete();

        setFollowed(false);
      } else if (viewUsername) {
        db.collection("users")
          .doc(viewUsername)
          .collection("followings")
          .doc(profileUsername)
          .set({ following: true });
        db.collection("users")
          .doc(profileUsername)
          .collection("followers")
          .doc(viewUsername)
          .set({ followed: true });
        setFollowed(true);
      } else {
        setLoginOpen(true);
      }
    }
  };
  return (
    <div>
      <Header
        key={loginOpen}
        setHomeUserName={setViewUsername}
        loginOpen={loginOpen}
        setLoginOpen={setLoginOpen}
      />
      {profileUsername ? (
        <div>
          <Link to={`/users/${profileUsername}`}>
            <Avatar
              className="post__avatar"
              alt={profileUsername}
              src={avatar}
            />
          </Link>
          <p>{postNo} posts</p>
          <p>{followerNo} followers</p>
          <p>{followingNo} following</p>
          {viewUsername === profileUsername ? (
            <></>
          ) : (
            <IconButton onClick={handleFollow}>
              {followed ? <HighlightOffIcon /> : <ControlPointIcon />}
            </IconButton>
          )}
          <div className="profile_posts">
            {postIds ? (
              <PostList
                postIds={postIds}
                curUsername={viewUsername}
                setLoginOpen={setLoginOpen}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      ) : (
        <p>No such user</p>
      )}
    </div>
  );
}

export default SingleUserPage;
