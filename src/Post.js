import React, { useState, useEffect, forwardRef } from "react";
import "./Post.css";
import Avatar from "@material-ui/core/Avatar";
import { db } from "./firebase";
import DeleteIcon from "@material-ui/icons/Delete";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import ShareIcon from "@material-ui/icons/Share";
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";
import { IconButton } from "@material-ui/core";
import Comment from "./Comment";
import { Link } from "react-router-dom";

const Post = forwardRef(
  ({ username, postId, imageUrl, caption, curUserName }, ref) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [avatar, setAvatar] = useState("/static/images/avatar/1.jpg");
    const [liked, setLiked] = useState();
    const [likedBy, setLikedBy] = useState();
    useEffect(() => {
      db.collection("avatars")
        .doc(username)
        .collection("avatarUrls")
        .orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
          if (!querySnapshot.empty) {
            setAvatar(querySnapshot.docs[0].data().avatarUrl);
          } else {
            console.log("No avatar");
          }
        });
      db.collection("posts")
        .doc(postId)
        .collection("likes")
        .doc(curUserName)
        .get()
        .then((doc) => {
          if (doc.exists) {
            //console.log(doc.data());
            setLiked(true);
          } else {
            //console.log("No likes from current user");
            setLiked(false);
          }
        });
      db.collection("posts")
        .doc(postId)
        .collection("likes")
        .onSnapshot((querySnapshot) => {
          setLikedBy(querySnapshot.docs.length);
        });

      //console.log(avatar);
    }, []);

    useEffect(() => {
      let unsubscribe;
      if (postId) {
        unsubscribe = db
          .collection("posts") //accessing posts
          .doc(postId) //going to that specific postId document
          .collection("comments") //going inside its comments collection
          .onSnapshot((snapshot) => {
            setComments(
              snapshot.docs.map((doc) => ({
                id: doc.id,
                comment: doc.data(),
              }))
            );
            // snapshot.docs.map((doc) => {
            //   console.log("Comment:");
            //   console.log(doc.data());
            // });
          }); //this on snapchat means anytime there's a new comment added
        //there's the listener to this specific post
      }

      return () => {
        unsubscribe();
      };
    }, [postId]);

    const postComment = (e) => {
      e.preventDefault();

      db.collection("posts").doc(postId).collection("comments").add({
        text: comment,
        username: curUserName,
      });
      setComment("");
    };

    const handleLike = (e) => {
      e.preventDefault();
      if (liked != null) {
        if (liked) {
          db.collection("posts")
            .doc(postId)
            .collection("likes")
            .doc(curUserName)
            .delete();
          setLiked(false);
        } else {
          db.collection("posts")
            .doc(postId)
            .collection("likes")
            .doc(curUserName)
            .set({ liked: true });
          setLiked(true);
        }
      }
    };
    return (
      <div className="post" ref={ref}>
        <div className="post__header">
          <div className="post__meta">
            <Link to={`/users/${username}`}>
              <Avatar className="post__avatar" alt={username} src={avatar} />
            </Link>
            <Link
              to={`/users/${username}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <h3>{username}</h3>
            </Link>
          </div>
          <div className="post__option">
            {curUserName && curUserName === username ? (
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                className="post__delete"
                onClick={() => {
                  db.collection("posts")
                    .doc(postId)
                    .collection("comments")
                    .onSnapshot((snapshot) => {
                      snapshot.docs.map((doc) => {
                        doc.ref.delete();
                      });
                    });
                  db.collection("posts").doc(postId).delete();
                  db.collection("users")
                    .doc(username)
                    .collection("postIds")
                    .doc(postId)
                    .delete();
                }}
              >
                <DeleteIcon style={{ fontSize: 20 }} className="delete-icon" />
              </IconButton>
            ) : (
              <></>
            )}
          </div>
        </div>
        {imageUrl ? (
          imageUrl.trim() === "" ? (
            <></>
          ) : (
            <img className="post__image" src={imageUrl} alt="post" />
          )
        ) : (
          <></>
        )}
        {caption ? (
          <h4 className="post__text">
            <Link
              to={`/users/${username}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {username}
            </Link>{" "}
            <span className="post__caption">{caption}</span>
          </h4>
        ) : (
          <></>
        )}
        <div className="post__button__row">
          <div className="post__button__row__left">
            <IconButton onClick={handleLike}>
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton href={`/posts/${postId}`}>
              <ChatBubbleOutlineIcon />
            </IconButton>
            <IconButton>
              <ShareIcon />
            </IconButton>
          </div>
          <div className="post__button__row__left">
            <IconButton>
              <BookmarkBorderIcon />
            </IconButton>
          </div>
        </div>
        <div className="post__comments">
          {comments.map(({ id, comment }) => {
            console.log("Comment id ", id);
            console.log("Commnet made by ", comment.username);
            return (
              <Comment
                key={id}
                commentId={id}
                postId={postId}
                curUserName={curUserName}
                username={comment.username}
                text={comment.text}
              />
            );
          })}
        </div>
        {likedBy > 0 ? (
          <div className="post__liked_by">Liked by {likedBy}</div>
        ) : (
          <></>
        )}
        {curUserName && (
          <form className="post__commentBox">
            <input
              className="post__input"
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              disabled={!comment}
              className="post__button"
              type="submit"
              onClick={postComment}
            >
              Post
            </button>
          </form>
        )}
      </div>
    );
  }
);

export default Post;
