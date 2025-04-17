import { useEffect, useState } from "react";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import { gapi } from "gapi-script";
import "./App.css";

const CLIENT_ID =
  "224297852846-6bapbsk9cn7lbk4r3uavmjcbka7i9oi1.apps.googleusercontent.com";
const API_KEY = "AIzaSyCSn0mPYtJoUGw5BAVTX4pKlTc63mgTmSQ";
const SCOPES = "https://www.googleapis.com/auth/drive";
const SCOPES_DOCS = "https://www.googleapis.com/auth/documents";

const App = () => {
  const [docID, setDocID] = useState("");
  const [isButtonShow, setIsButtonShow] = useState("None");

  useEffect(() => {
    function start() {
      gapi.client.init({
        key: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
      });
    }
    gapi.load("client:auth2", start);
  });

  function createFile(tag: string) {
    const accessToken = gapi.auth.getToken().access_token;
    fetch("https://docs.googleapis.com/v1/documents", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + accessToken }),
    })
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then(function (val) {
        console.log(val);
        setDocID(val.documentId);
        console.log(val.documentId);
        // window.open(
        //   "https://docs.google.com/document/d/" + val.documentId + "/edit",
        //   "_blank"
        // );
      });
  }

  const onSuccess = (res) => {
    console.log(res.profileObj);
    setIsButtonShow("LoggedIn")
  };

  const onFailure = (res) => {
    console.log(res);
    setIsButtonShow("Login_fail")

  };

  const onLogoutSuccess = () => {
    console.log("Log Out Success");
    setIsButtonShow("LoggedOut")
  };

  return (
    <div className="container">
      <div className="button-group">
        <GoogleLogin
          clientId={CLIENT_ID}
          buttonText="Login with Google"
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={"single_host_origin"}
          isSignedIn={true}
        />
        {isButtonShow === "LoggedIn" && (
          <GoogleLogout
          clientId={CLIENT_ID}
          buttonText="Logout"
          onLogoutSuccess={onLogoutSuccess}
        />
        )}
        
        <button disabled={false} className="btn create" onClick={() => createFile("CPTS 223")}>
          {isButtonShow === "LoggedIn" ? "Create Document" : "Need Login to Create Document"}
        </button>
      </div>
      <div>
        {docID && isButtonShow === "LoggedIn" && (
          <div className="iframe-wrapper">
            <iframe
              src={`https://docs.google.com/document/d/${docID}`}
              // width="100%"
              // height="600px"
              title="Google Docs"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
