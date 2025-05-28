import MainLayout from "../../../components/MainLayout/MainLayout";
import Hero from "../container/Hero"
import HomePageCard from "../container/HomePageCard";
import WhatToKnow from "../container/WhatToKnow";

const HomePage = () => {
    return (
        <MainLayout>
            <Hero />
            <HomePageCard />
            <WhatToKnow />
        </MainLayout>
    )
}

export default HomePage