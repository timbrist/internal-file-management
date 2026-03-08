"use client"

export default function LogoutBtn() {

    const handleLogout = async () =>  {
        await fetch("/api/logout", {
            cache: "no-store",
        }).catch(() => null);
        window.location.href = "/";
    }
  return (
    <>
    <button className="btn" onClick={handleLogout}>logout</button>
    </>
  );
}
