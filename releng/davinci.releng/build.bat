rem
rem  you must have some version of eclipse installed to build against
rem  create a directory to do the build in, build results will be in MAQETTA_BUILD_DIR\result
rem

rem
rem Path to parent directory of the eclipse application directory.
rem That is, if eclipse is installed in '/usr/local/eclipse', this property
rem would be set as 'base="/usr/local"'. No trailing backslash.
rem
set base=D:\MyDEvtools\eclipse.platform.releng.basebuilder-R38M6PlusRC3D

rem
rem Path to eclipse directory inclusive. The application directory is
rem usually, but not always, named 'eclipse'. It has sub-directories
rem \configuration, \features, \plugins, etc. No trailing backslash.
rem
set baseLocation=%base%\eclipse

rem
rem Version number of the launcher jar file. See %baseLocation%\plugins\org.eclipse.equinox.launcher_*.jar.
rem The launcher version is the set of alphanumeric characters between 'launcher_' and the '.' character
rem before the 'jar' file name suffix.
rem
set launcherVersion=1.3.0.v20111107-1631

rem
rem Directory in which to do the build. No trailing backslash.
rem
set MAQETTA_BUILD_DIR=D:\MyProjects\maqetta\build

rem
rem Directory containing build.xml (this should not have to be changed in most cases).
rem No trailing backslash.
rem
set relEngDir=%MAQETTA_BUILD_DIR%\repository\weblabs\releng\davinci.releng"

rem
rem If 'maqettaCode' is set, copy files from your local workspace instead of GitHub repository
rem
rem Note: This build feature is in incubation and *cannot* be used for production builds.
rem
rem set maqettaCode=c:\your\local\eclipse\workspace

rem
rem GitHub URL for Maqetta repository. This should not change.
rem
set gitRepository=https://github.com/ravi013/weblabs.git

rem
rem Windowing System, Operating System and processor Architecture settings
rem
rem Note: See %baseLocation%\plugins\org.eclipse.equinox.launcher.xxx.yyy.xxx\
rem       to determine your settings, they should be similar to 'cocoa.macosx.x86_64'
rem
set myOS=win32
set myWS=win32
set myArch=x86

rem
rem Set up for and pull down the latest code from GitHub
rem
IF NOT EXIST %MAQETTA_BUILD_DIR%\repository (
    rem "Making repository directory..."
    mkdir %MAQETTA_BUILD_DIR%\repository
)

rem
rem If '.git' directory exists we need only pull
rem
IF EXIST %MAQETTA_BUILD_DIR%\repository\weblabs\.git (
    rem "Doing 'git pull'..."
    cd %MAQETTA_BUILD_DIR%\repository\weblabs
    git pull
) ELSE (
    rem "Cloning repository. This may take a few moments..."
    cd %MAQETTA_BUILD_DIR%\repository
    git clone %gitRepository%
)

rem "Initializing and updating submodules..."
cd %MAQETTA_BUILD_DIR%\repository\weblabs
git submodule update --init --recursive

rem
rem Change directory to the build directory.
rem
rem Note: Many scripts use relative directory references making
rem       running the build from this directory *imperative*.
rem
cd %MAQETTA_BUILD_DIR%

java -Ddeployment-type=internal -DbuilderDir=D:\MyProjects\maqetta\releng\davinci.releng\orion\builder -Dtimestamp=20150323 -DbuildDirectory=D:\MyProjects\maqetta\build -jar %baseLocation%\plugins\org.eclipse.equinox.launcher_%launcherVersion%.jar -application org.eclipse.ant.core.antRunner -buildfile %relEngDir%\buildAll.xml 