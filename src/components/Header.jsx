import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

export default function Header() {
  const [pageState, setPageState] = useState("Sign in");
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState("profile");
      } else {
        setPageState("sign in");
      }
    });
  }, [auth]);
  function PathName(route) {
    if (route === location.pathname) {
      return true;
    }
  }
  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between px-3 max-w-6xl items-center mx-auto">
        <div>
          <img
            src="https://api.logo.com/api/v2/images?logo=logo_b23413ef-f447-4eea-879d-f68d6983f2d6&format=webp&margins=0&quality=60&width=500&background=transparent&u=1689412280"
            alt="logo"
            className="h-10 cursor-pointer"
            onClick={() => {
              navigate("/");
            }}
          />
        </div>
        <div>
          <ul className="flex space-x-10">
            <li
              className={`cursor-pointer font-semibold text-sm py-3 text-gray-300 border-b-[3px] border-b-transparent ${
                PathName("/") && " text-gray-950  border-b-blue-700"
              } `}
              onClick={() => {
                navigate("/");
              }}
            >
              Home
            </li>
            <li
              className={`cursor-pointer font-semibold text-sm py-3 text-gray-300 border-b-[3px] border-b-transparent ${
                PathName("/offers") && " text-gray-950  border-b-blue-700"
              } `}
              onClick={() => {
                navigate("/offers");
              }}
            >
              Offers
            </li>
            <li
              className={`cursor-pointer font-semibold text-sm py-3 text-gray-300 border-b-[3px] border-b-transparent ${
                (PathName("/sign-in") || PathName("/profile")) &&
                " text-gray-950  border-b-blue-700"
              } `}
              onClick={() => {
                navigate("/profile");
              }}
            >
              {pageState}
            </li>
          </ul>
        </div>
      </header>
    </div>
  );
}
