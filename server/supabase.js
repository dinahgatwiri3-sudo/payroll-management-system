import {createClient} from "@supabase/supabase-js";
const url=process.env.SUPABASE_URL, anon=process.env.VITE_SUPABASE_PUBLISHABLE_KEY, service=process.env.SUPABASE_SERVICE_ROLE_KEY;
export const authClient=url&&anon?createClient(url,anon,{auth:{persistSession:false}}):null;
export const db=url&&service?createClient(url,service,{auth:{persistSession:false}}):null;