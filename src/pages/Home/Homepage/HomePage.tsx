import MainLayout from "../../../components/MainLayout/MainLayout";
import Hero from "../container/Hero"
import HomePageCard from "../container/HomePageCard";
import LatestContent from "../container/LatestContent";

const HomePage = () => {
    return (
        <MainLayout>
            <Hero />
            <HomePageCard />
            <LatestContent />
        </MainLayout>
    )
}

export default HomePage