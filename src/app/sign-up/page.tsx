import { submitSignupAction } from "./action";
import styles from "./Signup.module.css";
import { SignupForm } from "./signup-form/SignupForm";

export default function SignupPage() {
  return (
    <section className={styles.signupWrapper}>
      <SignupForm submitSignupAction={submitSignupAction} />
    </section>
  );
}
