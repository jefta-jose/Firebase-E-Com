import { homeBanner } from "../assets";
import Container from "./Container";
import LinkButton from "./LinkButton";

import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import { db } from "../lib/firebase";

const HomeBanner = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        console.warn("User is not logged in.");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid); // Ensure `user.uid` exists
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserRole(userData.role);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchUserRole();
  }, [db, user]);

  return (
    <div>
      <Container className="relative py-5 overflow-hidden">
            <div className={userRole == "admin" ? "hidden" : "visible"}>
              <div className=" relative">
              <img
                src={homeBanner}
                alt="homeBanner"
                className="w-full h-full object-cover rounded-md"
              />
              <div className="w-full h-full absolute top-0 left-0 bg-black/10" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <h2 className="text-xl md:text-4xl lg:text-6xl text-whiteText font-bold">
                Mi Air Purifier
              </h2>
              <p className="text-base md:text-lg font-semibold leading-6 text-whiteText/90 max-w-[250px] pb-1">
                The new tech gift you are wishing for right here.
              </p>
              <LinkButton className="w-44 flex items-center justify-center bg-whiteText text-darkText hover:bg-darkText hover:text-whiteText duration-200 pb-2" />
            </div>
            </div>



        {userRole === "admin" && (
          <div>
            <h1>Testing to see</h1>
          </div>
        )}
      </Container>
    </div>
  );
};

export default HomeBanner;
