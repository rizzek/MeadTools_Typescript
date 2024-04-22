import React, { SetStateAction, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "../../helpers/Login";
import Loading from "../Loading";
import RecipeCard from "./RecipeCard";
import { Opened, RecipeData } from "../../App";
import Title from "../Title";
import { IoSettingsSharp, IoLogOutSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";

interface UserInfo {
  id: number;
  email: string;
  google_id: string | null;
  role: "user" | "admin";
  recipes: { id: number; user_id: number; name: string }[];
}

export default function Account({
  token,
  user,
  setToken,
  setUser,
  isDarkTheme,
  setTheme,
  isMetric,
  setIsMetric,
}: {
  token: string | null;
  user: { id: number; role: "user" | "admin" } | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: React.Dispatch<
    React.SetStateAction<{ id: number; role: "user" | "admin" } | null>
  >;
  isDarkTheme: boolean;
  setTheme: React.Dispatch<SetStateAction<boolean>>;
  isMetric: boolean;
  setIsMetric: React.Dispatch<SetStateAction<boolean>>;
}) {
  const [isOpened, setOpened] = useState(false);
  const { i18n } = useTranslation();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const columns =
    userInfo?.recipes && userInfo?.recipes.length < 5
      ? userInfo?.recipes.length
      : 5;

  const navigate = useNavigate();
  useEffect(() => {
    if (!token) navigate("/login");
    else
      (async () => {
        const user = await getUserInfo(token);
        if (user) {
          setUserInfo(user);
          setUser((prev) => ({ ...prev, id: user.id, role: user.role }));
          console.log(user);
        } else {
          alert("Login failed");
          navigate("/login");
        }
      })();
  }, [token]);
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/account");
    }
  }, [user]);
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      main.addEventListener("click", () => {
        setOpened(false);
      });
    }
    return () => {
      main?.removeEventListener("click", () => {
        setOpened(false);
      });
    };
  }, []);

  return (
    <div className="w-screen flex items-center justify-center h-screen">
      {userInfo ? (
        <div className="w-11/12 sm:w-9/12 flex flex-col items-center rounded-xl bg-sidebar p-8 my-8 relative">
          <div className="absolute right-12 top-4 flex w-12 gap-2 text-3xl">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                setToken(null);
              }}
            >
              <IoLogOutSharp />
            </button>
            <button className="relative" onClick={() => setOpened(!isOpened)}>
              <IoSettingsSharp />
            </button>
            <div
              className={`${
                isOpened || "hidden"
              } absolute right-0 top-0 translate-y-1/4 translate-x-2/4 bg-sidebar border-solid border-2 border-textColor rounded-xl flex justify-center items-center w-[15rem]`}
              onClick={() => setOpened(true)}
            >
              <ul className="text-sm w-full flex flex-col justify-center items-center mx-4 my-2 py-2">
                <li className="flex justify-between w-full py-2">
                  <p> Preferred Theme</p>
                  <select
                    className="h-5 bg-background text-center text-[.5rem]  md:text-sm rounded-xl  border-2 border-solid border-textColor hover:bg-sidebar hover:border-background"
                    name="theme"
                    id="theme"
                    value={isDarkTheme ? "dark" : "light"}
                    onChange={(e) => setTheme(e.target.value === "dark")}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </li>
                <li className="flex justify-between w-full py-2">
                  <p> Preferred Language</p>
                  <select
                    className="h-5 bg-background text-center text-[.5rem]  md:text-sm rounded-xl  border-2 border-solid border-textColor hover:bg-sidebar hover:border-background"
                    name="lang"
                    id="lang"
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                  >
                    <option value="en">EN</option>
                    <option value="de">DE</option>
                  </select>
                </li>
                <li className="flex justify-between w-full py-2">
                  <p> Preferred Units</p>
                  <select
                    className="h-5 bg-background text-center text-[.5rem]  md:text-sm rounded-xl  border-2 border-solid border-textColor hover:bg-sidebar hover:border-background"
                    name="units"
                    id="units"
                    value={isMetric ? "metric" : "us"}
                    onChange={(e) => setIsMetric(e.target.value === "metric")}
                  >
                    <option value="us">US</option>
                    <option value="metric">Metric</option>
                  </select>
                </li>
              </ul>
            </div>
          </div>
          <Title header="Account" />
          <div className="flex flex-col items-center justify-center w-full">
            <h2>Hello {userInfo.email}</h2>

            <div
              className={`grid grid-cols-${columns} justify-center items-center gap-4 text-center`}
            >
              <h2 className={`text-2xl text-center col-span-${columns}`}>
                My Recipes
              </h2>
              {userInfo.recipes.map((recipe) => (
                <RecipeCard recipe={recipe} token={token} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
}