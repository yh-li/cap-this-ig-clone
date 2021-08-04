import React from "react";

function SingleUserPage(props) {
  return <div>{props.match.params.userId}</div>;
}

export default SingleUserPage;
