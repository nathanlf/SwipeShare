import { getChatById } from "@/utils/supabase/queries/chat";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useEffect, useState } from "react";
import { Chat } from "@/utils/supabase/models/chat";
import { z } from "zod";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { GetServerSidePropsContext } from "next/dist/types";
import { User } from "@supabase/supabase-js";

interface TestingPageProps {
  user: User; // Type this more specifically if you have a User type
}

export default function TestingPage({ user }: TestingPageProps) {
  const [chatData, setChatData] = useState<z.infer<typeof Chat> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Log the user data when component mounts
  useEffect(() => {
    console.log("User data from props:", user);
  }, [user]);

  useEffect(() => {
    async function fetchChat() {
      try {
        // Initialize Supabase client
        const supabase = createSupabaseComponentClient();

        // Fetch chat data
        const chat = await getChatById(
          supabase,
          "5210cc44-9e27-451a-9867-9921a6ca6d13"
        );
        console.log("Fetched chat:", chat);
        setChatData(chat);
      } catch (err: unknown) {
        console.error("Error fetching chat:", err);
        // Properly handle the unknown type
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      }
    }

    fetchChat();
  }, []);

  return (
    <div className="p-8 mt-[-100px]">
      <h1 className="text-2xl font-bold mb-4">Test Chat Fetch</h1>

      {/* Display user info */}
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        <h2 className="text-xl font-bold mb-2">User Data:</h2>
        <pre className="bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {chatData && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>
            <strong>Chat ID:</strong> {chatData.id}
          </p>
          <p>
            <strong>User 1:</strong> {chatData.user_1?.name || "Unknown"}
          </p>
          <p>
            <strong>User 2:</strong> {chatData.user_2?.name || "Unknown"}
          </p>
          <pre className="mt-4 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(chatData, null, 2)}
          </pre>
        </div>
      )}

      {!chatData && !error && <p>Loading chat data...</p>}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  console.log("Server-side user data:", userData);
  console.log("Server-side user error:", userError);

  if (userError || !userData) {
    console.log("Authentication failed, redirecting to login");
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  console.log(userData);

  return {
    props: {
      user: userData.user,
    },
  };
}
