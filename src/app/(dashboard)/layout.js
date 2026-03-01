"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader, BottomNav } from "@/components/layout";
import HomeScreen from "@/components/screens/home-screen";
import ProfileScreen from "@/components/screens/profile-screen";
import CustomizeExperienceScreen from "@/components/screens/customize-experience-screen";
import EditProfileScreen from "@/components/screens/edit-profile-screen";
import DeveloperOptionsScreen from "@/components/screens/developer-options-screen";

function DashboardLayoutInner({ children }) {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") || "Home";
    const initialSub = searchParams.get("sub") || null;
    const initialTip = searchParams.get("tip") === "ai";

    const [activeTab, setActiveTab] = useState(initialTab);
    const [subScreen, setSubScreen] = useState(initialSub);
    const [showAITip, setShowAITip] = useState(initialTip);

    // Effect to handle URL param changes if needed
    React.useEffect(() => {
        const tab = searchParams.get("tab");
        const sub = searchParams.get("sub");
        const tip = searchParams.get("tip");

        if (tab) setActiveTab(tab);
        if (sub) setSubScreen(sub);
        if (tip === "ai") setShowAITip(true);
    }, [searchParams]);

    // When a tab is clicked
    const handleTabChange = (tabLabel) => {
        setActiveTab(tabLabel);
        setSubScreen(null); // Reset sub-screens when changing tabs
        setShowAITip(false);
    };

    const renderContent = () => {
        if (activeTab === "Profile") {
            if (subScreen === "customize-experience") {
                return (
                    <CustomizeExperienceScreen
                        onBack={() => setSubScreen(null)}
                        defaultShowTooltip={showAITip}
                    />
                );
            }
            if (subScreen === "edit-profile") {
                return (
                    <EditProfileScreen onBack={() => setSubScreen(null)} />
                );
            }
            if (subScreen === "developer-options") {
                return (
                    <DeveloperOptionsScreen onBack={() => setSubScreen(null)} />
                );
            }
            return (
                <ProfileScreen
                    onNavigate={(screen) => setSubScreen(screen)}
                />
            );
        }

        // Default: Home tab (renders children which is current page.js)
        return children;
    };

    const getHeader = () => {
        if (activeTab === "Profile") {
            if (subScreen === "customize-experience" || subScreen === "edit-profile" || subScreen === "developer-options") {
                return null; // Both sub-screens have internal headers
            }
            return (
                <AppHeader
                    pageTitle="Profile"
                    hideBack
                />
            );
        }
        return <AppHeader />;
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white">
            {/* Fixed Header Area */}
            <div className="flex-none">
                {getHeader()}
            </div>

            {/* Scrollable Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-white">
                <div className="min-h-full">
                    {renderContent()}
                </div>
            </main>

            {/* Fixed Navigation Area */}
            <div className="flex-none bg-white">
                <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }) {
    return (
        <React.Suspense fallback={null}>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </React.Suspense>
    );
}
