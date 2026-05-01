import { submitSigninAction } from "./action";
import styles from "./Login.module.css";
import { SigninForm } from "./signin-form/SigninForm";

export default function SigninPage() {
  return (
    <section className={styles.loginWrapper}>
      <SigninForm submitSigninAction={submitSigninAction} />
    </section>
  );
}
