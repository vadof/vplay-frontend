import {Injectable} from '@angular/core';
import {HttpService} from "../http.service";
import {IUpgrade} from "../../models/clicker/IUpgrade";
import {ISectionUpgrades} from "../../models/clicker/ISectionUpgrades";

@Injectable({
  providedIn: 'root'
})
export class UpgradeService {

  private sectionUpgrades: ISectionUpgrades[] = [];
  private sectionUserUpgrades: ISectionUpgrades[] = [];


  constructor(private http: HttpService) {

  }

  public async getUpgrades(userUpgrades: IUpgrade[]): Promise<ISectionUpgrades[]> {
    if (this.sectionUpgrades.length === 0) {
      this.sectionUpgrades = await this.http.get('/v1/clicker/upgrades') as ISectionUpgrades[];
    }

    const userUpgradesMap: Map<string, IUpgrade> = new Map();
    userUpgrades.forEach(upgrade => {
      userUpgradesMap.set(upgrade.name, upgrade);
    });


    for (let i: number = 0; i < this.sectionUpgrades.length; i++) {
      let sectionUpgrade: ISectionUpgrades = this.sectionUpgrades[i];

      let upgrades = sectionUpgrade.upgrades;
      let updatedUpgrades: IUpgrade[] = []
      upgrades.forEach(u => updatedUpgrades.push(userUpgradesMap.get(u.name)!));

      let userSectionUpgrade: ISectionUpgrades = {
        order: sectionUpgrade.order,
        section: sectionUpgrade.section,
        upgrades: updatedUpgrades}

      this.sectionUserUpgrades.push(userSectionUpgrade);
    }

    return this.sectionUserUpgrades;
  }
}
