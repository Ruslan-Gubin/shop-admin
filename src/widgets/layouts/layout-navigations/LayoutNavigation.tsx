import { useRouter, usePathname } from "next/navigation";
import { LayoutNavsGroup } from "../layout-navs-group/LayoutNavsGroup";
import {
  personalAccountNavs,
  // workspaceNavs,
} from "../../../shared/constants/side-menu";
// import { ServicesSvg } from "../../../shared/svg/side-menu/ServicesSvg";
import styles from "./LayoutNavigation.module.scss";
import { MainImage } from "@/shared/ui/image-main/ImageMain";

type Props = {
  isOpen: boolean;
  onToggleMenu: () => void;
};

const LayoutNavigation = ({ isOpen, onToggleMenu }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <section
        className={
          !isOpen ? `${styles.root} ${styles.rootHidden}` : styles.root
        }
      >
        <button onClick={onToggleMenu} className={styles.menuButton}>
          <MainImage
            src={"/assets/arrow-close.png"}
            alt="Arrow toggle button png"
            classImg={styles.menuButtonImage}
          />
        </button>
        <header className={styles.menuHeader}></header>

        <LayoutNavsGroup
          menuIsOpen={isOpen}
          navsList={personalAccountNavs}
          onNavigate={router.push}
          pathname={pathname}
          title="Личный кабинет"
        />
        {/* <LayoutNavsGroup */}
        {/*   menuIsOpen={isOpen} */}
        {/*   navsList={workspaceNavs} */}
        {/*   onNavigate={router.push} */}
        {/*   pathname={pathname} */}
        {/*   title="Рабочее пространство" */}
        {/* /> */}

        {/* <footer> */}
        {/*   <div className={styles.navItem} onClick={() => router.push("/")}> */}
        {/*     <ServicesSvg />О сервисе */}
        {/*   </div> */}
        {/* </footer> */}
      </section>
    </>
  );
};

export { LayoutNavigation };
