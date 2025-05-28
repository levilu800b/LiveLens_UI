import MainLayout from "../../../components/MainLayout/MainLayout";
import Hero from "../container/Hero"
import HomePageCard from "../container/HomePageCard";

const HomePage = () => {
    return (
        <MainLayout>
            <Hero />
            <HomePageCard />
        </MainLayout>
    )
}

export default HomePage