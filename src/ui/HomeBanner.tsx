import { homeBanner } from "../assets";
import { getUserRole } from "../lib/localStore";
import Container from "./Container";
import LinkButton from "./LinkButton";

const HomeBanner = () => {
  const userRole = getUserRole();

  return (
    <div>
      <Container className="relative py-5 overflow-hidden">
        {/* Show content only if userRole is not 'admin' */}
        {userRole !== "admin" && (
          <div className="relative">
            <img
              src={homeBanner}
              alt="homeBanner"
              className="w-full h-full object-cover rounded-md"
            />
            <div className="w-full h-full absolute top-0 left-0 bg-black/10" />
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
        )}

        {/* Admin content */}
        {userRole === "admin" && (
          <div>
            <h1>Admin DashBoard To come here</h1>
          </div>
        )}
      </Container>
    </div>
  );
};

export default HomeBanner;
