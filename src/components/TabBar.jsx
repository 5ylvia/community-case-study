import { NavLink, useNavigate } from "react-router-dom";
import { Handshake, CookingPot, ForkKnife, User, Bell, SignIn } from "./icons";
import { useAuth } from "../lib/auth";
import symbol from "../assets/symbol.svg";

export default function TabBar() {
  const navigate = useNavigate();
  const { guest, hasUnread, basePath } = useAuth();
  const tabs = [
    { to: `${basePath}/homemeal`, icon: CookingPot, label: "Home Meal" },
    { to: `${basePath}/together`, icon: Handshake, label: "Together" },
    { to: `${basePath}/reco`, icon: ForkKnife, label: "Food Picks" },
    { to: "/me", icon: User, label: "Profile" },
  ];
  const visibleTabs = guest ? tabs.filter((t) => !t.to.endsWith("/me")) : tabs;
  return (
    <nav className="
      fixed z-50 bg-paper2 border-line
      bottom-0 left-0 right-0 flex justify-around border-t pb-[env(safe-area-inset-bottom,0px)]
      md:top-0 md:bottom-0 md:left-0 md:right-auto md:flex-col md:justify-start md:gap-1 md:w-20 md:border-t-0 md:border-r md:pt-4 md:pb-4
    ">
      <div className="hidden md:flex md:flex-col md:items-center mb-4">
        <img src={symbol} alt="Dajeong" className="w-10 h-10" />
      </div>
      {visibleTabs.map((t) => {
        const Icon = t.icon;
        return (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-3 flex-1 no-underline transition-colors duration-200
              md:flex-none md:py-3 md:rounded-xl md:mx-1.5
              ${isActive ? "text-ink md:bg-ink/8" : "text-ink-soft hover:text-ink"}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={24} weight={isActive ? "fill" : "regular"} />
                <span className="text-tag mt-0.5 font-semibold">{t.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
      {guest ? (
        <button
          onClick={() => navigate("/login")}
          className="text-ember cursor-pointer transition-colors duration-200 hidden md:flex md:flex-col md:items-center md:mt-auto md:py-3 md:mx-1.5 hover:text-ember-deep"
        >
          <SignIn size={24} />
          <span className="text-tag mt-0.5 font-semibold">Log in</span>
        </button>
      ) : (
        <div className="hidden md:flex md:flex-col md:items-center md:mt-auto md:py-3 md:mx-1.5">
          <button onClick={() => navigate("/notifications")} className="relative text-ink-soft hover:text-ink transition-colors cursor-pointer">
            <Bell size={24} />
            {hasUnread && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-flame-red rounded-full border border-paper2" />}
            <span className="text-tag mt-0.5 font-semibold">Alerts</span>
          </button>
        </div>
      )}
    </nav>
  );
}
