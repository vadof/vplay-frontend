import {Component, Input, OnInit} from '@angular/core';
import {UpgradeService} from "../../../services/clicker/upgrade.service";
import {ISectionUpgrades} from "../../../models/clicker/ISectionUpgrades";
import {IUpgrade} from "../../../models/clicker/IUpgrade";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-upgrades',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    NgIf
  ],
  templateUrl: './upgrades.component.html',
  styleUrl: './upgrades.component.scss'
})
export class UpgradesComponent implements OnInit {
  section: string = '';
  @Input({required: true}) userUpgrades: IUpgrade[] = [];

  private sectionUpgrades: ISectionUpgrades[] = [];
  sections: string[] = [];
  upgrades: IUpgrade[] = [];

  constructor(private upgradeService: UpgradeService) {

  }

  ngOnInit() {
    this.upgradeService.getUpgrades(this.userUpgrades).then(res => {
      this.sectionUpgrades = res;
      console.log(this.sectionUpgrades);
      this.sectionUpgrades.forEach(su => this.sections.push(su.section));
      this.changeSection(this.sections[0]);
    })
  }

  changeSection(value: string) {
    this.section = value;
    this.upgrades = this.sectionUpgrades.find(su => su.section === value)!.upgrades;
  }
}
