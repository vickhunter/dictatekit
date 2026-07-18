{
  description = "DictateKit – privacy-first voice dictation, meeting transcription & notes";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      supportedSystems = [ "x86_64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          dictatekit = pkgs.callPackage ./nix/package.nix { };
        in
        {
          default = dictatekit;
          dictatekit = dictatekit;
        }
      );

      overlays.default = _final: _prev: {
        dictatekit = self.packages.x86_64-linux.dictatekit;
      };

      nixosModules.default = import ./nix/module.nix self;
    };
}
