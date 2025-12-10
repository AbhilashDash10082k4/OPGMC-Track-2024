import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function main() {
  const chatCompletion = await getGroqChatCompletion();
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function getGroqChatCompletion(stringData: string[]) {
  const res = groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Given the array of strings ${stringData}, convert these strings into individual JSON elements. The keys of JSON are -
        [
        "serial_no","neet_pg_roll_no","percentile","state_appln_no","name","type","old_composite_cmr_r_3","composite_new_cmr_spl_stray","new_cmr_ins_cmr_spl_stray","new_dir_cmr_spl_stray","new_dip_cmr_spl_stray","admission_status","admitted_course","admitted_college","admitted_subject","admitted_category","admitted_round"
        ]. Take the chunks separated by space and map all the individual strings to the keys given in the array.`,
      },
    ],
    model: "openai/gpt-oss-20b",
  });
  return res;
}
