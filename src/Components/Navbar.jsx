import React from "react";
import githubIcon from "../assets/github.svg";

const Navbar = ({ user, onLogout }) => {

    const openGithub = () => {
        window.open("https://github.com/surajmanjhi01", "_blank",);
    };

    return (
        <header className="sticky top-0 z-20 border-b border-lime-200 bg-white/85 px-4 py-3 backdrop-blur sm:px-6">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">PassOP</h1>
                    <p className="text-xs font-medium text-lime-700">Private vault, personal access</p>
                </div>

                <div className="flex items-center gap-3">
                    {user?.name && (
                        <span className="hidden rounded-full border border-lime-300 bg-lime-50 px-3 py-1 text-sm font-semibold text-lime-700 sm:inline-block">
                            {user.name}
                        </span>
                    )}

                    <button
                        onClick={openGithub}
                        onTouchStart={openGithub}
                        className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
                    >
                        <span className="flex items-center gap-2">
                            <img src={githubIcon} className="invert w-5" />
                            GitHub
                        </span>
                    </button>

                    {user && (
                        <button
                            onClick={onLogout}
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                        >
                            Sign out
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
