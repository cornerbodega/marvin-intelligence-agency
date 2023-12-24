import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

function Auth0LoginButtons() {
  const { user, error, isLoading } = useUser();

  return (
    <div className="flex justify-end space-x-4">
      {user ? null : (
        <div>
          <Link
            href="/api/auth/login"
            className="btn btn-primary btn-block"
            tabIndex={0}
          >
            Sign In
          </Link>
        </div>
      )}
      {user ? (
        <div>
          <Link
            className="btn btn-primary btn-block"
            href="/api/auth/logout"
            tabIndex={0}
          >
            Log out
          </Link>
        </div>
      ) : null}
    </div>
  );
}
export default Auth0LoginButtons;
